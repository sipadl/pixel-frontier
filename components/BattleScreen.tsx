'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameStore, type BattleSquadMember, type EnemyWaveMember, type BattleState } from '@/store/gameStore'
import CharacterSprite from '@/components/CharacterSprite'
import stagesRaw from '@/game/data/stages.json'

const allStages = stagesRaw as { id: number; name: string; waves: number; energy: number; boss: boolean; bg: string }[]

const ELEM_EMOJI: Record<string, string> = {
  fire: '🔥', ice: '❄️', wind: '💨', earth: '🌿', light: '✨', dark: '🌑',
}

const ROLE_MAP: Record<string, string> = {
  warrior: 'knight', knight: 'knight', mage: 'mage', archer: 'archer',
  cleric: 'healer', healer: 'healer', guardian: 'guardian', rogue: 'rogue',
}

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

// ── GOLD ORNAMENTAL BORDER (replaces GachaBorder) ──
function GoldFrame({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-yellow-600 via-amber-400 to-yellow-600 opacity-50 blur-[2px] pointer-events-none" />
      <div className="relative rounded-xl border-2 bg-slate-900/95 backdrop-blur-sm p-4"
        style={{ borderColor: 'rgba(217,161,50,0.6)', boxShadow: '0 0 20px rgba(217,161,50,0.2)' }}>
        {children}
      </div>
      {/* Corner rivets */}
      {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_4px_rgba(217,161,50,0.6)]`} />
      ))}
    </div>
  )
}

// ── TURN BANNER ──
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
    `🌊 Wave ${wave}/${totalWaves}`

  return (
    <div className="absolute inset-x-0 top-[28%] z-30 flex justify-center pointer-events-none">
      <div className="animate-turn-banner relative px-10 py-3 font-pixel text-base text-yellow-200 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(10,14,39,0.92), rgba(15,20,45,0.95))',
          boxShadow: '0 0 30px rgba(250,204,21,0.2), inset 0 0 20px rgba(0,0,0,0.5)',
          border: '1px solid rgba(250,204,21,0.3)',
        }}>
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-500/80 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-500/80 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-500/80 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-500/80 rounded-br" />
        <span className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">{label}</span>
      </div>
    </div>
  )
}

// ── UNIT PORTRAIT — clickable in battle grid ──
function UnitPortrait({
  member, onAttack, isPlayerTurn,
}: {
  member: BattleSquadMember
  onAttack: () => void
  isPlayerTurn: boolean
}) {
  if (!member.isAlive || member.hp <= 0) {
    return (
      <div className="aspect-square rounded-xl bg-slate-900/80 border-2 border-slate-700/40 flex flex-col items-center justify-center opacity-40">
        <span className="text-2xl opacity-30">💀</span>
        <span className="font-pixel text-[9px] text-slate-600 mt-1">DOWN</span>
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
      className={`relative overflow-hidden aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 p-1.5 transition-all duration-200 ${
        isPlayerTurn ? 'active:scale-95' : 'pointer-events-none'
      }`}
      style={{
        borderColor: isPlayerTurn ? 'rgba(250,204,21,0.6)' : 'rgba(75,85,99,0.3)',
        background: isPlayerTurn
          ? 'linear-gradient(180deg, rgba(15,25,50,0.95), rgba(10,14,39,0.98))'
          : 'linear-gradient(180deg, rgba(10,14,39,0.5), rgba(5,8,20,0.6))',
        boxShadow: isPlayerTurn ? '0 0 16px rgba(250,204,21,0.12)' : 'none',
      }}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: isPlayerTurn ? 'rgba(250,204,21,0.4)' : 'rgba(75,85,99,0.2)' }} />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: isPlayerTurn ? 'rgba(250,204,21,0.4)' : 'rgba(75,85,99,0.2)' }} />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: isPlayerTurn ? 'rgba(250,204,21,0.4)' : 'rgba(75,85,99,0.2)' }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: isPlayerTurn ? 'rgba(250,204,21,0.4)' : 'rgba(75,85,99,0.2)' }} />

      {/* Character sprite */}
      <CharacterSprite type={ROLE_MAP[member.role] || 'knight'} size={44} />

      {/* Name */}
      <span className="font-pixel text-[9px] text-white truncate w-full text-center">
        {ELEM_EMOJI[member.element] || ''} {member.name}
      </span>

      {/* HP bar */}
      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
        <div className={`h-full ${hpColor} rounded-full transition-all duration-300`}
          style={{ width: `${hpPct}%` }} />
      </div>

      {/* BB bar */}
      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div className="h-full bg-gradient-to-r from-purple-700 to-purple-400 rounded-full transition-all"
          style={{ width: `${member.bbGauge}%` }} />
      </div>

      {bbFull && isPlayerTurn && (
        <span className="font-pixel text-[8px] text-yellow-400 animate-pulse">BB READY</span>
      )}
    </button>
  )
}

// ── MAIN BATTLE SCREEN ──
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
  const triggerBraveBurst = useGameStore(s => s.triggerBraveBurst)
  const toggleAutoBattle = useGameStore(s => s.toggleAutoBattle)
  const startBattle = useGameStore(s => s.startBattle)
  const returnToTown = useGameStore(s => s.returnToTown)
  const resetBattleForRetry = useGameStore(s => s.resetBattleForRetry)

  const autoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  const isPlayerTurn = battleState === 'PLAYER_TURN'
  const [attackingUnitId, setAttackingUnitId] = useState<string | null>(null)
  const [flashTargetId, setFlashTargetId] = useState<string | null>(null)

  const handleUnitAttack = (instanceId: string) => {
    setAttackingUnitId(instanceId)
    setFlashTargetId(instanceId)
    setTimeout(() => setAttackingUnitId(null), 300)
    triggerUnitAttack(instanceId)
  }

  useEffect(() => {
    if (!flashTargetId) return
    const timeout = setTimeout(() => setFlashTargetId(null), 800)
    return () => clearTimeout(timeout)
  }, [flashTargetId])

  const aliveSquad = battleSquadState.filter(m => m.isAlive)
  const aliveEnemies = enemyWave.filter(e => e.isAlive)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [battleLog.length])

  const runAutoBattle = useCallback(() => {
    if (!isPlayerTurn || aliveSquad.length === 0 || aliveEnemies.length === 0) return
    const bbHero = aliveSquad.find(h => h.bbGauge >= 100)
    const hero = bbHero || aliveSquad[0]
    if (hero.bbGauge >= 100) triggerBraveBurst(hero.instanceId)
    else triggerUnitAttack(hero.instanceId)
  }, [isPlayerTurn, aliveSquad, aliveEnemies, triggerUnitAttack, triggerBraveBurst])

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

  const handleNextDungeon = () => {
    const nextStageId = (currentStage || 0) + 1
    const nextStage = allStages.find(s => s.id === nextStageId)
    if (nextStage) startBattle(nextStageId)
    else returnToTown()
  }

  // ═══ REWARD SCREEN ═══
  if (battleState === 'REWARD_SCREEN') {
    return (
      <div className="h-full overflow-hidden bg-black flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-transparent to-yellow-900/10 pointer-events-none" />
        <h1 className="font-pixel text-3xl text-yellow-300 mb-2 animate-pulse-glow relative z-10"
          style={{ textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
          🏆 STAGE CLEAR
        </h1>
        <p className="font-pixel text-sm text-slate-400 mb-6 relative z-10">
          Wave {totalWaves} complete!
        </p>
        <GoldFrame className="w-full max-w-xs mb-6 relative z-10">
          <p className="font-pixel text-sm text-yellow-300 text-center mb-3">— LOOT —</p>
          {showResult?.rewards && (
            <div className="space-y-2">
              <div className="flex justify-between items-center font-pixel text-sm">
                <span className="text-purple-300">💎 Gems</span>
                <span className="text-purple-400">+{showResult.rewards.gems}</span>
              </div>
              <div className="flex justify-between items-center font-pixel text-sm">
                <span className="text-yellow-300">🪙 Gold</span>
                <span className="text-yellow-400">+{showResult.rewards.gold}</span>
              </div>
              <div className="flex justify-between items-center font-pixel text-sm">
                <span className="text-green-300">✨ EXP</span>
                <span className="text-green-400">+{showResult.rewards.exp}</span>
              </div>
            </div>
          )}
        </GoldFrame>
        <div className="space-y-3 w-full max-w-xs relative z-10">
          <button onClick={handleNextDungeon}
            className="w-full font-pixel text-sm py-4 rounded-2xl text-white active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(180deg, #0891b2, #155e75)', boxShadow: '0 4px 20px rgba(8,145,178,0.4)', border: '2px solid rgba(34,211,238,0.4)' }}>
            ⚔️ NEXT DUNGEON
          </button>
          <button onClick={returnToTown}
            className="w-full font-pixel text-sm py-4 rounded-2xl text-white active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(180deg, #4b5563, #1f2937)', border: '2px solid rgba(156,163,175,0.3)' }}>
            🏠 RETURN TO TOWN
          </button>
        </div>
      </div>
    )
  }

  // ═══ GAME OVER ═══
  if (battleState === 'GAME_OVER') {
    return (
      <div className="h-full overflow-hidden bg-black flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(127,29,29,0.4)_100%)] pointer-events-none" />
        <h1 className="font-pixel text-3xl text-red-400 mb-2 animate-shake relative z-10"
          style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
          💀 SQUAD WIPE
        </h1>
        <p className="font-pixel text-sm text-slate-500 mb-6 relative z-10">
          All units defeated at Wave {currentWave}/{totalWaves}
        </p>
        <div className="space-y-3 w-full max-w-xs relative z-10">
          <button onClick={resetBattleForRetry}
            className="w-full font-pixel text-sm py-4 rounded-2xl text-white active:scale-[0.97] transition-all animate-pulse-glow"
            style={{ background: 'linear-gradient(180deg, #eab308, #c2410c)', boxShadow: '0 4px 20px rgba(234,179,8,0.3)', border: '2px solid rgba(250,204,21,0.5)' }}>
            🔄 RETRY (Free)
          </button>
          <button onClick={returnToTown}
            className="w-full font-pixel text-sm py-4 rounded-2xl text-white active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(180deg, #4b5563, #1f2937)', border: '2px solid rgba(156,163,175,0.3)' }}>
            🏠 RETURN TO TOWN
          </button>
        </div>
      </div>
    )
  }

  // ═══ MAIN BATTLE VIEW ═══
  return (
    <div className={`h-full overflow-hidden bg-slate-950 flex flex-col relative ${bgCls}`}>
      <TurnBanner battleState={battleState} wave={currentWave} totalWaves={totalWaves} />

      {/* ── TOP: Combat Area (55%) ── */}
      <div className="relative h-[55%] overflow-hidden pointer-events-none">
        {/* BG layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="battle-bg-sky absolute inset-0" />
          <div className="battle-stars" />
          <div className="battle-bg-mid" />
          <div className="battle-bg-ground" />
        </div>

        {/* Wave badge */}
        <div className="absolute top-2 inset-x-0 z-20 flex justify-center">
          <div className="px-5 py-1.5 font-pixel text-xs text-yellow-300 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(10,14,39,0.9), rgba(15,20,45,0.95))',
              border: '1px solid rgba(250,204,21,0.25)',
            }}>
            🌊 Wave {currentWave}/{totalWaves}
          </div>
        </div>

        {/* Squad formation — diagonal left-bottom */}
        <div className="absolute bottom-[8%] left-[4%] z-10 flex flex-col gap-2">
          {aliveSquad.map((member, i) => (
            <div key={member.instanceId} className="relative"
              style={{ transform: `translateX(${i * 8}px)` }}>
              <CharacterSprite
                type={ROLE_MAP[member.role] || 'knight'}
                size={56}
              />
              {/* HP mini bar */}
              <div className="absolute bottom-0 inset-x-1 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                <div className={`h-full rounded-full ${(member.hp / member.maxHp) > 0.5 ? 'bg-green-500' : (member.hp / member.maxHp) > 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(member.hp / member.maxHp) * 100}%` }} />
              </div>
              {member.instanceId === flashTargetId && (
                <div className="absolute inset-0 bg-white/30 rounded-lg animate-pulse pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Enemies — diagonal right-top */}
        <div className="absolute top-[15%] right-[4%] z-10 flex flex-col gap-2 items-end">
          {aliveEnemies.map((enemy, i) => (
            <div key={enemy.instanceId} className="flex items-center gap-2"
              style={{ transform: `translateX(${-i * 8}px)` }}>
              <div className="text-right">
                <p className="font-pixel text-xs text-red-300">{enemy.name}</p>
                <p className="font-pixel text-[9px] text-red-400">{enemy.hp}/{enemy.maxHp}</p>
              </div>
              <div className="relative">
                <div className={enemy.isBoss ? 'scale-125' : ''}>
                  <CharacterSprite type={enemy.isBoss ? 'guardian' : 'rogue'} size={enemy.isBoss ? 72 : 52} />
                </div>
                <div className="absolute bottom-0 inset-x-1 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                </div>
                {enemy.isBoss && (
                  <span className="absolute -top-3 -right-1 font-pixel text-[8px] bg-red-900 border border-red-500 rounded px-1.5 py-0.5 text-red-300">
                    BOSS
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating damage popups */}
        {damagePopups.map(popup => (
          <div key={popup.id}
            className={`damage-number ${popup.type === 'crit' ? 'crit' : popup.type === 'enemy' ? 'enemy-dmg' : popup.type === 'element' ? 'element-weak' : ''}`}
            style={{ left: popup.targetSide === 'enemy' ? '58%' : '22%', top: `${15 + popup.targetIdx * 12}%` }}>
            {popup.type === 'enemy' ? '-' : ''}{popup.amount}
            {popup.type === 'crit' && '✦'}
            {popup.type === 'element' && '✦'}
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-600 to-transparent shrink-0" />

      {/* ── BOTTOM: Control Panel (45%) ── */}
      <div className={`relative h-[45%] flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 shrink-0 ${controlDisabled ? 'pointer-events-none opacity-60' : ''}`}>

        {/* Auto-battle toggle — BIG */}
        <div className="flex justify-center py-2">
          <button
            disabled={controlDisabled && !autoBattle}
            onClick={toggleAutoBattle}
            className={`font-pixel text-xs px-6 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
              autoBattle
                ? 'bg-green-900/60 border-green-500 text-green-300 animate-auto-pulse'
                : 'bg-slate-800 border-slate-600 text-slate-400'
            }`}>
            {autoBattle ? '⚡ AUTO ON' : '⏸ AUTO OFF'}
          </button>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center px-4 py-1">
          <span className="font-pixel text-xs text-slate-500">
            {isPlayerTurn ? '⚔️ YOUR TURN' : battleState === 'ENEMY_TURN' ? '👹 ENEMY TURN...' : '⏳ ...'}
          </span>
          <span className="font-pixel text-xs text-slate-500">
            {aliveSquad.length} alive / {aliveEnemies.length} enemies
          </span>
        </div>

        {/* 2x3 Unit Portrait Grid — BIG */}
        <div className="flex-1 px-3 pb-2">
          <div className="grid grid-cols-3 gap-2.5 h-full">
            {battleSquadState.map((member, idx) => (
              <UnitPortrait
                key={member.instanceId || `empty-${idx}`}
                member={member}
                onAttack={() => {
                  if (!isPlayerTurn) return
                  if (member.bbGauge >= 100) triggerBraveBurst(member.instanceId)
                  else handleUnitAttack(member.instanceId)
                }}
                isPlayerTurn={isPlayerTurn}
              />
            ))}
          </div>
        </div>

        {/* Battle log — BIGGER */}
        <div className="h-12 overflow-y-auto bg-black/40 mx-2 mb-2 rounded-lg px-3 py-1 border border-slate-800/50">
          {battleLog.slice(-3).map((msg, i) => (
            <p key={i} className="font-pixel text-[9px] text-slate-500 leading-relaxed">{msg}</p>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  )
}
