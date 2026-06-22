import { Howl, Howler } from 'howler'

// ===== SOUND FILES (free from freesound.org / opengameart.org) =====
// We use base64 encoded tiny sounds as fallback if no audio files

const SOUNDS = {
  // BGM
  menu: '/audio/menu.mp3',
  village: '/audio/village.mp3',
  forest: '/audio/forest.mp3',
  cave: '/audio/cave.mp3',
  battle: '/audio/battle.mp3',
  boss: '/audio/boss.mp3',

  // SFX
  attack: '/audio/attack.mp3',
  skill: '/audio/skill.mp3',
  heal: '/audio/heal.mp3',
  hit: '/audio/hit.mp3',
  victory: '/audio/victory.mp3',
  defeat: '/audio/defeat.mp3',
  gacha: '/audio/gacha.mp3',
  gacha_legendary: '/audio/gacha_legendary.mp3',
  chest: '/audio/chest.mp3',
  step: '/audio/step.mp3',
  npc_talk: '/audio/npc_talk.mp3',
  menu_click: '/audio/menu_click.mp3',
  level_up: '/audio/level_up.mp3',
  escape: '/audio/escape.mp3',
  error: '/audio/error.mp3',
}

// Create Howl instances with lazy loading
let bgmInstance: Howl | null = null
let currentBgm: string | null = null

const sfxCache: Record<string, Howl> = {}

function getSfx(name: string): Howl {
  if (!sfxCache[name]) {
    sfxCache[name] = new Howl({
      src: [SOUNDS[name as keyof typeof SOUNDS]],
      volume: 0.6,
      onloaderror: () => {
        // Silently fail if audio file not found
      }
    })
  }
  return sfxCache[name]
}

export const SoundSystem = {
  // BGM
  playBgm(name: string) {
    if (currentBgm === name && bgmInstance?.playing()) return
    this.stopBgm()
    try {
      bgmInstance = new Howl({
        src: [SOUNDS[name as keyof typeof SOUNDS]],
        loop: true,
        volume: 0.3,
        onloaderror: () => {}
      })
      bgmInstance.play()
      currentBgm = name
    } catch {}
  },

  stopBgm() {
    if (bgmInstance) {
      bgmInstance.fade(bgmInstance.volume(), 0, 500)
      setTimeout(() => {
        bgmInstance?.stop()
        bgmInstance = null
      }, 500)
    }
    currentBgm = null
  },

  // SFX
  play(name: string) {
    try {
      const sfx = getSfx(name)
      if (sfx) sfx.play()
    } catch {}
  },

  setVolume(vol: number) {
    Howler.volume(vol)
  },

  mute() {
    Howler.mute(true)
  },

  unmute() {
    Howler.mute(false)
  },
}
