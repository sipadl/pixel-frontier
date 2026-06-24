'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameStore, type BattleSquadMember, type EnemyWaveMember, type BattleState } from '@/store/gameStore'
import SvgCharacterRenderer from '@/components/battle/SvgCharacterRenderer'
import GachaBorder from '@/components/ui/GachaBorder'
import stagesRaw from '@/game/data/stages.json'

const allStages = stagesRaw as { id: number; name: string; waves: number; energy: number; boss: boolean; bg: string }[]

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}

// Map UnitDef.sprite → SvgCharacterRenderer classType
function spriteToClass(sprite: string): 'knight' | 'mage' | 'archer' {
  if (sprite === 'mage' || sprite === 'cleric') return 'mage'
  if (sprite === 'archer' || sprite === 'rogue') return 'archer'
  return 'knight'
}

// Battle BG theme from stage
function bgThemeClass(stageId: number | null): string {
  if (!stageId) return ''
  if (stageId <= 2) return 'battle-bg-forest'
  if (stageId === 3) return 'battle-bg-forest'
  if (stageId === 4) return 'battle-bg-cave'
  if (stageId === 5) return 'battle-bg-volcano'
  if (stageId === 6 || stageId === 9) return 'battle-bg-ice'
  if (stageId === 7) return 'battle-bg-volcano'
  if (stageId === 8 || stageId === 10) return 'battle-bg-dark'
  return 'battle-bg-cave'
}

// ──────────────────────────────────────────────────────────────
// TURN BANNER — shows PLAYER TURN / ENEMY TURN / WAVE X
// ──────────────────────────────────────────────────────────────
function TurnBanner({ battleState, wave, totalWaves }: { battleState: BattleState; wave: number; totalWaves: number }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    setShow(true)
    const t = setTimeout(() => setShow(false), 1200)
    return () => clearTimeout(t)
  }, [battleState, wave])

  if (!show) return null

  const label =
    battleState === 'ENEMY_TURN' ? '⚡ ENEMY TURN' :
    battleState === 'PLAYER_TURN' ? '⚔️ YOUR TURN' :
    battleState === 'ANIMATION_PLAYING' ? '' :
    ''

  return (
    <div className="absolute inset-x-0 top-[30%] z-30 flex justify-center pointer-events-none">
      <div className="animate-turn-banner font-pixel text-sm text-white px-6 py-2 bg-black/70 border border-yellow-500/50 rounded-lg backdrop-blur-sm">
        {label || `🌊 Wave ${wave}/${totalWaves}`}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// UNIT PORTRAIT — used in 2x3 grid
// ──────────────────────────────────────────────────────────────
function UnitPortrait({
  member,
  onAttack,
  onBB,
  isPlayerTurn,
}: {
  member: BattleSquadMember
  onAttack: () => void
  onBB: () => void
  isPlayerTurn: boolean
}) {
  if (!member.isAlive || member.hp <= 0) {
    return (
      <div className="aspect-square rounded-lg bg-slate-900/80 border border-slate-700/50 flex flex-col items-center justify-center opacity-30">
        <span className="text-lg opacity-30">💀</span>
        <span className="font-pixel text-[5px] text-slate-600 mt-1">DOWN</span>
      </div>
    )
  }

  const hpPct = (member.hp / member.maxHp) * 100
  const bbFull = member.bbGauge >= 100
  const hpColor = hpPct > 60 ? 'bg-green-500' : hpPct > 30 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <button
      disabled={!isPlayerTurn}
      onClick={onAttack}
      className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all duration-200 ${
        isPlayerTurn
          ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-cyan-600/60 active:scale-95 active:border-cyan-400 shadow-lg shadow-cyan-900/20'
          : 'bg-slate-900/60 border-slate-700/40 pointer-events-none opacity-60'
      }`}
    >
      {/* Mini character preview */}
      <div className="w-8 h-8 flex items-center justify-center">
        <SvgCharacterRenderer
          classType="knight"
          element={member.element as any}
          size={36}
          isDead={false}
        />
      </div>

      {/* Name */}
      <span className="font-pixel text-[4px] text-white truncate w-full text-center mt-0.5">
        {ELEM_EMOJI[member.element] || ''} {member.name}
      </span>

      {/* HP bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
        <div className={`h-full ${hpColor} rounded-full transition-all duration-300`} style={{ width: `${hpPct}%` }} />
      </div>

      {/* BB bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${member.bbGauge}%` }} />
      </div>

      {/* BB READY badge */}
      {bbFull && isPlayerTurn && (
        <span className="font-pixel text-[4px] text-yellow-400 animate-pulse mt-0.5">BB</span>
      )}
    </button>
  )
}

// ──────────────────────────────────────────────────────────────
// MAIN BATTLE SCREEN
// ──────────────────────────────────────────────────────────────
export default function BattleScreen() {
  const battleState = useGameStore(s => s.battleState)
  const currentStage = useGameStore(s => s.currentStage)
  const currentWave = useGameStore(s => s.currentWave)
  const totalWaves = useGameStore(s => s.totalWaves)
  const battleSquadState = useGameStore(s => s.battleSquadState)
  const enemyWave = useGameStore(s => s.enemyWave)
  const battleLog = useGameStore(s => s.battleLog)
  const damagePopups = useGameStore(s => s.damagePopups)
  const autoBattle = useGameStore(s => s.autoBattle)
  const showResult = useGameStore(s => s.showResult)

  const triggerUnitAttack = useGameStore(s => s.triggerUnitAttack)
  const braveBurst = useGameStore(s => s.braveBurst)
  const toggleAutoBattle = useGameStore(s => s.toggleAutoBattle)
  const startBattle = useGameStore(s => s.startBattle)
  const returnToTown = useGameStore(s => s.returnToTown)
  const resetBattleForRetry = useGameStore(s => s.resetBattleForRetry)

  const autoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  // Derived
  const isPlayerTurn = battleState === 'PLAYER_TURN'
  const aliveSquad = battleSquadState.filter(m => m.isAlive)
  const aliveEnemies = enemyWave.filter(e => e.isAlive)

  // Auto-scroll battle log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [battleLog.length])

  // ── Auto-battle ──
  const runAutoBattle = useCallback(() => {
    if (!isPlayerTurn || aliveSquad.length === 0 || aliveEnemies.length === 0) return

    // Pick hero with full BB first, else first alive
    const bbHero = aliveSquad.find(h => h.bbGauge >= 100)
    const hero = bbHero || aliveSquad[0]

    const enemyIdx = enemyWave.findIndex(e => e.isAlive)
    if (enemyIdx === -1) return

    if (hero.bbGauge >= 100) {
      braveBurst(battleSquadState.indexOf(hero), enemyIdx)
    } else {
      triggerUnitAttack(hero.instanceId)
    }
  }, [isPlayerTurn, aliveSquad, aliveEnemies, enemyWave, battleSquadState, triggerUnitAttack, braveBurst])

  useEffect(() => {
    if (!autoBattle || !isPlayerTurn || aliveSquad.length === 0 || aliveEnemies.length === 0) {
      if (autoTimerRef.current) { clearInterval(autoTimerRef.current); autoTimerRef.current = null }
      return
    }
    autoTimerRef.current = setInterval(runAutoBattle, 900)
    return () => { if (autoTimerRef.current) { clearInterval(autoTimerRef.current); autoTimerRef.current = null } }
  }, [autoBattle, isPlayerTurn, aliveSquad.length, aliveEnemies.length, runAutoBattle])

  const bgCls = bgThemeClass(currentStage)
  const controlDisabled = battleState !== 'PLAYER_TURN'

  // ── NEXT DUNGEON logic ──
  const handleNextDungeon = () => {
    const nextStageId = (currentStage || 0) + 1
    const nextStage = allStages.find(s => s.id === nextStageId)
    if (nextStage) {
      startBattle(nextStageId)
    } else {
      returnToTown()
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  REWARD SCREEN OVERLAY
  // ═══════════════════════════════════════════════════════════
  if (battleState === 'REWARD_SCREEN') {
    return (
      <div className="h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
        {/* BG glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-transparent to-yellow-900/10 pointer-events-none" />

        {/* Stage Clear text */}
        <h1 className="font-pixel text-2xl text-yellow-300 mb-2 animate-pulse-glow relative z-10">
          🏆 STAGE CLEAR
        </h1>
        <p className="font-pixel text-[8px] text-slate-400 mb-8 relative z-10">
          Wave {totalWaves} complete!
        </p>

        {/* Loot card */}
        <GachaBorder variant="gold" className="w-64 mb-8 relative z-10">
          <div className="p-4 space-y-3">
            <p className="font-pixel text-[8px] text-yellow-300 text-center mb-3">— LOOT —</p>
            {showResult?.rewards && (
              <>
                <div className="flex justify-between items-center font-pixel text-[9px]">
                  <span className="text-purple-300">💎 Gems</span>
                  <span className="text-purple-400">+{showResult.rewards.gems}</span>
                </div>
                <div className="flex justify-between items-center font-pixel text-[9px]">
                  <span className="text-yellow-300">🪙 Gold</span>
                  <span className="text-yellow-400">+{showResult.rewards.gold}</span>
                </div>
                <div className="flex justify-between items-center font-pixel text-[9px]">
                  <span className="text-green-300">✨ EXP</span>
                  <span className="text-green-400">+{showResult.rewards.exp}</span>
                </div>
              </>
            )}
          </div>
        </GachaBorder>

        {/* Action buttons */}
        <div className="space-y-3 w-64 relative z-10">
          <button
            onClick={handleNextDungeon}
            className="w-full font-pixel text-[10px] py-3 bg-gradient-to-b from-cyan-600 to-cyan-800 border-2 border-cyan-400 rounded-lg text-white active:scale-95 transition-all shadow-lg shadow-cyan-500/30"
          >
            ⚔️ NEXT DUNGEON
          </button>
          <button
            onClick={returnToTown}
            className="w-full font-pixel text-[10px] py-3 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-400 rounded-lg text-white active:scale-95 transition-all"
          >
            🏠 RETURN TO TOWN
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  //  GAME OVER OVERLAY
  // ═══════════════════════════════════════════════════════════
  if (battleState === 'GAME_OVER') {
    return (
      <div className="h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
        {/* Red vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(127,29,29,0.4)_100%)] pointer-events-none" />

        <h1 className="font-pixel text-2xl text-red-400 mb-2 animate-shake relative z-10">
          💀 SQUAD WIPE
        </h1>
        <p className="font-pixel text-[8px] text-slate-500 mb-8 relative z-10">
          All units defeated at Wave {currentWave}/{totalWaves}
        </p>

        {/* Retry / Return buttons — HSR style */}
        <div className="space-y-3 w-64 relative z-10">
          <button
            onClick={resetBattleForRetry}
            className="w-full font-pixel text-[10px] py-3 bg-gradient-to-b from-yellow-600 to-orange-700 border-2 border-yellow-400 rounded-lg text-white active:scale-95 transition-all shadow-lg shadow-yellow-500/30 animate-pulse-glow"
          >
            🔄 RETRY (Free)
          </button>
          <button
            onClick={returnToTown}
            className="w-full font-pixel text-[10px] py-3 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-400 rounded-lg text-white active:scale-95 transition-all"
          >
            🏠 RETURN TO TOWN
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  //  MAIN BATTLE VIEW (60/40 split)
  // ═══════════════════════════════════════════════════════════
  return (
    <div className={`h-screen overflow-hidden bg-slate-950 flex flex-col relative ${bgCls}`}>

      {/* ─── Turn Banner ─── */}
      <TurnBanner battleState={battleState} wave={currentWave} totalWaves={totalWaves} />

      {/* ─── TOP: Visual Combat Area (60%) ─── */}
      <div className="relative h-[60%] overflow-hidden pointer-events-none">
        {/* Parallax BG */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="battle-bg-sky absolute inset-0" />
          <div className="battle-stars" />
          <div className="battle-bg-mid" />
          <div className="battle-bg-ground" />
        </div>

        {/* Wave indicator */}
        <div className="absolute top-1 inset-x-0 z-20 text-center">
          <span className="font-pixel text-[7px] text-slate-400 bg-black/50 px-3 py-0.5 rounded-full border border-slate-700/50">
            Wave {currentWave}/{totalWaves}
          </span>
        </div>

        {/* ── Squad Formation: diagonal left-bottom ── */}
        <div className="absolute bottom-[8%] left-[4%] z-10 flex flex-col gap-1">
          {aliveSquad.map((member, i) => (
            <div key={member.instanceId} className="flex items-center gap-1"
              style={{ transform: `translateX(${i * 6}px)`, opacity: 1 - i * 0.08 }}>
              <div className="relative">
                <SvgCharacterRenderer
                  classType={spriteToClass('warrior')}
                  element={member.element as any}
                  size={52}
                  isAttacking={false}
                />
                {/* HP bar overlay */}
                <div className="absolute bottom-0 inset-x-1 h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${(member.hp / member.maxHp) > 0.5 ? 'bg-green-500' : (member.hp / member.maxHp) > 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(member.hp / member.maxHp) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Enemies: diagonal right-top ── */}
        <div className="absolute top-[15%] right-[4%] z-10 flex flex-col gap-1 items-end">
          {aliveEnemies.map((enemy, i) => (
            <div key={enemy.instanceId} className="flex items-center gap-1"
              style={{ transform: `translateX(${-i * 6}px)`, opacity: 1 - i * 0.08 }}>
              <div className="relative">
                {/* Boss = larger */}
                <div className={enemy.isBoss ? 'scale-125' : ''}>
                  <SvgCharacterRenderer
                    classType={enemy.isBoss ? 'knight' : 'mage'}
                    element="fire"
                    size={enemy.isBoss ? 64 : 48}
                  />
                </div>
                {/* HP bar */}
                <div className="absolute bottom-0 inset-x-1 h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                </div>
                {/* Boss badge */}
                {enemy.isBoss && (
                  <span className="absolute -top-2 -right-1 font-pixel text-[6px] bg-red-900 border border-red-500 rounded px-1 text-red-300">BOSS</span>
                )}
              </div>
              <div className="text-right">
                <p className="font-pixel text-[4px] text-red-300">{enemy.name}</p>
                <p className="font-pixel text-[3px] text-red-400">{enemy.hp}/{enemy.maxHp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Floating Damage Popups ── */}
        {damagePopups.map(popup => (
          <div
            key={popup.id}
            className={`damage-number ${popup.type === 'crit' ? 'crit' : popup.type === 'enemy' ? 'enemy-dmg' : popup.type === 'element' ? 'element-weak' : ''}`}
            style={{
              left: popup.targetSide === 'enemy' ? '58%' : '22%',
              top: `${15 + popup.targetIdx * 12}%`,
            }}
          >
            {popup.type === 'enemy' ? '-' : ''}{popup.amount}
            {popup.type === 'crit' && '✦'}
            {popup.type === 'element' && '✦'}
          </div>
        ))}
      </div>

      {/* ─── Divider line ─── */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-600 to-transparent" />

      {/* ─── BOTTOM: Control Panel (40%) ─── */}
      <div className={`relative h-[40%] flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 ${
        controlDisabled ? 'pointer-events-none opacity-60' : ''
      }`}>

        {/* Auto-battle toggle */}
        <div className="flex justify-center py-1.5">
          <button
            disabled={controlDisabled && !autoBattle}
            onClick={toggleAutoBattle}
            className={`font-pixel text-[6px] px-3 py-1 rounded border transition-all ${
              autoBattle
                ? 'bg-green-900/60 border-green-500 text-green-300 animate-auto-pulse'
                : 'bg-slate-800 border-slate-600 text-slate-400'
            }`}
          >
            {autoBattle ? '⚡ AUTO ON' : '⏸ AUTO OFF'}
          </button>
        </div>

        {/* Status bar */}
        <div className="flex justify-between items-center px-3 py-1">
          <span className="font-pixel text-[5px] text-slate-500">
            {isPlayerTurn ? '⚔️ YOUR TURN' : battleState === 'ENEMY_TURN' ? '👹 ENEMY TURN...' : '⏳ PROCESSING...'}
          </span>
          <span className="font-pixel text-[5px] text-slate-500">
            {aliveSquad.length} alive / {aliveEnemies.length} enemies
          </span>
        </div>

        {/* 2x3 Unit Portrait Grid */}
        <div className="flex-1 px-3 pb-2">
          <div className="grid grid-cols-3 gap-2 h-full">
            {battleSquadState.map((member, idx) => (
              <UnitPortrait
                key={member.instanceId || `empty-${idx}`}
                member={member}
                onAttack={() => {
                  if (!isPlayerTurn) return
                  if (member.bbGauge >= 100) {
                    // Auto-target first enemy with BB
                    const eIdx = enemyWave.findIndex(e => e.isAlive)
                    if (eIdx !== -1) braveBurst(idx, eIdx)
                  } else {
                    triggerUnitAttack(member.instanceId)
                  }
                }}
                onBB={() => {
                  const eIdx = enemyWave.findIndex(e => e.isAlive)
                  if (eIdx !== -1) braveBurst(idx, eIdx)
                }}
                isPlayerTurn={isPlayerTurn}
              />
            ))}
          </div>
        </div>

        {/* Mini battle log */}
        <div className="h-8 overflow-y-auto bg-black/40 mx-2 mb-1 rounded px-2 py-0.5 border border-slate-800/50">
          {battleLog.slice(-3).map((msg, i) => (
            <p key={i} className="font-pixel text-[4px] text-slate-500 leading-relaxed">{msg}</p>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  )
}
