import {
  duoLayer,
  ifApp,
  ifDevice, ifInputSource,
  ifVar,
  map,
  mapDoubleTap,
  mapSimultaneous,
  rule,
  toKey,
  toSetVar,
  withCondition,
  writeToProfile,
} from 'karabiner.ts'

// modskey '⌘' | '⌥' | '⌃' | '⇧'

const vimLayerKey = 'duo-layer-vim';
const vimNoticeKey = `duo-layer-${vimLayerKey}`;

const jetJrainsApp = ['^com.jetbrains.[\\w-]+$', '^com.googlecode.iterm2$']

function main() {
  writeToProfile('Default', [
      ruleBasic(),
      ruleOptionSymbol(),
      ruleBuildInKeyboard(),
      ruleNotBuildInKeyboard(),
      ruleIme(),
      ruleVimForJapanese(),
      ruleImeForJetBrains(),
    ],
    {
      'basic.simultaneous_threshold_milliseconds': 150,
      'duo_layer.threshold_milliseconds': 150,
      'duo_layer.notification': true,
    },
  )
}

const ruleBasic = () => {
  return rule('Control').manipulators([
    map('c', '⌃').to('escape').to('japanese_eisuu'),
    map('q', '⌘').toIfHeldDown('q', '⌘', {repeat: false})
  ])
}

const ruleBuildInKeyboard = () => {
  return rule("build_in")
    .condition(
      ifDevice({is_built_in_keyboard: true}))
    .manipulators([
      map('semicolon').to('left_control').toIfAlone('return_or_enter'),
      map('spacebar').to('left_option').toIfAlone('spacebar'),
      map('right_command').to('right_option').toIfAlone('delete_or_backspace'),
      mapDoubleTap(',').toTypeSequence(':'),
      mapDoubleTap('/').toTypeSequence('-'),
    ]);
}

const ruleNotBuildInKeyboard = () => {
  return rule("build_in")
    .condition(
      ifDevice({is_built_in_keyboard: false}))
    .manipulators([
      // 押しっぱなしで日本語
      map('right_shift')
        .to([
          toSetVar('caps_lock_pressed', 1),
          toKey('japanese_kana'),
        ])
        .toAfterKeyUp([
          toSetVar('caps_lock_pressed', 0),
          toKey('japanese_eisuu'),
        ]),
    ]);
}

const ruleOptionSymbol = () => {
  return rule("option").manipulators([
    map('q', '⌥').toTypeSequence('!'),
    map('w', '⌥').toTypeSequence('@'),
    map('e', '⌥').toTypeSequence('#'),
    map('r', '⌥').toTypeSequence('$'),
    map('t', '⌥').toTypeSequence('%'),
    map('y', '⌥').toTypeSequence('^'),
    map('u', '⌥').toTypeSequence('&'),
    map('i', '⌥').toTypeSequence('*'),
    map('o', '⌥').toTypeSequence('`'),
    map('p', '⌥').toTypeSequence('~'),

    map('a', '⌥').toTypeSequence('+'),
    mapDoubleTap('s', '⌥').toTypeSequence('<').singleTap(toKey('9', ['left_shift'])),
    mapDoubleTap('d', '⌥').toTypeSequence('>').singleTap(toKey('0', ['left_shift'])),
    map('f', '⌥').toTypeSequence('='),
    map('g', '⌥').toTypeSequence(':'),
    map('h', '⌥').to('←'),
    map('j', '⌥').to('↓'),
    map('k', '⌥').to('↑'),
    map('l', '⌥').to('→'),

    map('z', '⌥').toTypeSequence('|'),
    mapDoubleTap('x', '⌥').toTypeSequence('[').singleTap(toKey('open_bracket', ['left_shift'])),
    mapDoubleTap('c', '⌥').toTypeSequence(']').singleTap(toKey('close_bracket', ['left_shift'])),
    map('v', '⌥').toTypeSequence('\''),
    map('b', '⌥').toTypeSequence('\"'),
    map('n', '⌥').toTypeSequence('\\'),
    map('m', '⌥').toTypeSequence('_'),
    map(',', '⌥').toTypeSequence('['),
    map('.', '⌥').toTypeSequence(']'),
    map('/', '⌥').toTypeSequence('-'),
  ])
}

const ruleIme = () => {
  return rule('IME').manipulators([
    map('f16').to('japanese_kana').toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey), // for QMK
    map('escape').to('japanese_eisuu'), // for QMK
    withCondition(ifInputSource({language: 'ja'}))([
      map('slash').to('hyphen'),
      map('return_or_enter', '⌃').to('semicolon', '⌃'),
      // for alfred
      map('delete_or_backspace', ['⌥','⌘']).to('japanese_eisuu')
  ])
    // for QMK
    // mapSimultaneous(['k', 'j']).to('japanese_eisuu').to('escape'),
    // mapSimultaneous(['j', 'k']).to('japanese_eisuu').to('escape'),
  ])
}

const ruleImeForJetBrains = () => {
  return duoLayer('j', 'k').threshold(100)
    .toIfActivated(toKey("japanese_eisuu"))
    .toIfActivated(toKey("open_bracket", 'left_control'))
    .condition(ifApp(jetJrainsApp))
}

const ruleVimForJapanese = () => {
  const VisualMode = 'VisualMode';
  return duoLayer('j', 'k', vimLayerKey).threshold(100)
    .toIfActivated(toKey("japanese_eisuu"))
    .toIfActivated(toSetVar(VisualMode, 0))
    .condition(ifApp(jetJrainsApp).unless())
    .leaderMode({sticky: true})
    .notification('Normal Mode')
    .manipulators([
      map('a').to('→').toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey),
      map('i').toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey),
      map('o').to('e', 'left_control').to('return_or_enter').toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey),
      map('u').to('z', '⌘'),
      map('x').toVar(VisualMode, 0).to('⌦'),
      map('p').to('v', '⌘').toVar(VisualMode, 0),
      mapDoubleTap('d').toVar(VisualMode, 0).to('a', '⌃').to('k', '⌃'),
      map('d', '⇧').toVar(VisualMode, 0).to("k", '⌃'),
      map("r", '⌃').to("z", ['⇧', '⌘']),
      map("u", '⌃').to('up_arrow', ['⌥']),
      map("d", '⌃').to('down_arrow', ['⌥']),
      map("g", '⇧').to('up_arrow', ['⌘']),
      mapDoubleTap('g').to('down_arrow', '⌘'),
      withCondition(ifVar(VisualMode, 0))([
        map('v').toVar(VisualMode, 1),
        map('h').to('←'),
        map('j').to('↓'),
        map('k').to('↑'),
        map('l').to('→'),
        map("w").to('right_arrow', ['⌥']),
        map("b").to('left_arrow', ['⌥']),
        mapDoubleTap('y').to('a', '⌃').to('e', '⌃⇧').to('c', '⌘'),
      ]),
      withCondition(ifVar(VisualMode, 1))([
        map('v').toVar(VisualMode, 0).to('←'),
        mapSimultaneous(['k', 'j']).toVar(VisualMode, 0).to('←'),
        map('h').to('←', '⇧'),
        map('j').to('↓', '⇧'),
        map('k').to('↑', '⇧'),
        map('l').to('→', '⇧'),
        map('d').to('delete_or_backspace').toVar(VisualMode, 0),
        map('y').to('c', 'left_command').toVar(VisualMode, 0),
        map("w").to('right_arrow', ['⌥', '⇧']),
        map("b").to('left_arrow', ['⌥', '⇧']),
      ]),
    ])
}


main();
