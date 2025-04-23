const sfxr = require('lib/sfxr')

const SOUND_ENABLED = false

function randomFloat(min = 0, max = 1) { return (Math.random() * (max - min)) + min }

function randomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// #34XyKT2SeuexHMuHgdw66dRGC3i9GugVus1skniXCetD5NegsgXWh7fTYPxDWGVTHDS7UR5eQ4AyXCaU7wJKbYCF9L5144m4oSpd2V54krLJCv4KjzKrvWVUw
const SCAN_SYSTEM_SOUND = {
  "oldParams": true,
  "wave_type": 1,
  "p_env_attack": -0.040082935037877646,
  "p_env_sustain": 0.25,
  "p_env_punch": 0.037,
  "p_env_decay": 0.642,
  "p_base_freq": 0.071,
  "p_freq_limit": 0,
  "p_freq_ramp": -0.028198616856674942,
  "p_freq_dramp": 0.0011712191101830027,
  "p_vib_strength": -0.01077275711324166,
  "p_vib_speed": 0.04400350168406989,
  "p_arp_mod": 0.8353083925945181,
  "p_arp_speed": 0.6815739544514399,
  "p_duty": 0.01922594260812474,
  "p_duty_ramp": 0.3354864734063555,
  "p_repeat_speed": -0.015802133895095043,
  "p_pha_offset": -0.0420288362602598,
  "p_pha_ramp": 0.02484259098376988,
  "p_lpf_freq": 0.9067078472016343,
  "p_lpf_ramp": -0.12501434216193583,
  "p_lpf_resonance": 0.8349296613509855,
  "p_hpf_freq": 0.022627963150169905,
  "p_hpf_ramp": -0.012515634457654835,
  "sound_vol": 0.07,
  "sample_rate": 11025,
  "sample_size": 8,
  "p_vib_delay": null
}

// #12CeWQTAYNTUPqCMrtJE7HJJvzqDEjL13MmqPCC5i1iWQR2MeeaXevCVyaCUA3EtrMXQ4s4UtCHhoGSG46SgzNWSKpDye5DoVMpgC8uV6Rv6njQ59CuGn8nuK1
const LOADING_SOUND = {
  "oldParams": true,
  "wave_type": 0,
  "p_env_attack": 0.2719999849796295,
  "p_env_sustain": 1,
  "p_env_punch": 0.12299999594688416,
  "p_env_decay": 0.07399999350309372,
  "p_base_freq": 0.08799999952316284,
  "p_freq_limit": 0,
  "p_freq_ramp": 0.2709999978542328,
  "p_freq_dramp": -0.32199999690055847,
  "p_vib_strength": 0.032999999821186066,
  "p_vib_speed": 0.6789999604225159,
  "p_arp_mod": -0.39799997210502625,
  "p_arp_speed": 0.8689999580383301,
  "p_duty": 0.8289999961853027,
  "p_duty_ramp": 0.5949999690055847,
  "p_repeat_speed": 0.9759999513626099,
  "p_pha_offset": 0.3739999830722809,
  "p_pha_ramp": -0.5369999408721924,
  "p_lpf_freq": 0.7539999485015869,
  "p_lpf_ramp": 0.6919999718666077,
  "p_lpf_resonance": 0.1889999955892563,
  "p_hpf_freq": 0.115,
  "p_hpf_ramp": -0.824,
  "sound_vol": 0.03,
  "sample_rate": 11025,
  "sample_size": 8
}

let LOADING_SOUND_PLAYERS = []
function playLoadingSound() {
  if (!SOUND_ENABLED) return
  if (LOADING_SOUND_PLAYERS.length === 0) {
    for (let i = 0; i < 10; i++) {
      const sample = LOADING_SOUND
      sample.p_env_sustain = randomFloat(.4, .6)
      sample.p_base_freq = randomFloat(.07, .09)
      sample.p_duty =  randomFloat(.9, .99)
      LOADING_SOUND_PLAYERS[i] = sfxr.toAudio(sample)
    }
  }
  setTimeout(() => {
    LOADING_SOUND_PLAYERS[randomInt(0, LOADING_SOUND_PLAYERS.length - 1)].play()
  }, randomInt(0,200))
}

let SCAN_SYSTEM_SOUND_PLAYER
function scanSystemSound() {
  if (!SOUND_ENABLED) return
  if (!SCAN_SYSTEM_SOUND_PLAYER) SCAN_SYSTEM_SOUND_PLAYER = sfxr.toAudio(SCAN_SYSTEM_SOUND)
  SCAN_SYSTEM_SOUND_PLAYER.play()
}

module.exports = {
  playLoadingSound,
  scanSystemSound
}
