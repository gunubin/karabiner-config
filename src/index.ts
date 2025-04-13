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
const vimVisualMode = 'VisualModeForVim';
const vimNoticeKey = `duo-layer-${vimLayerKey}`;

const jetJrainsApp = ['^com.jetbrains.[\\w-]+$', '^com.googlecode.iterm2$']

function main() {
  writeToProfile('Default', [
      ruleBasic(),
      ruleApp(),
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
    withCondition(ifApp(['^com.googlecode.iterm2$']).unless())([
      map('c', '⌃').to('escape').to('japanese_eisuu').toVar(vimVisualMode).toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey),
    ]),
    map('q', '⌘').toIfHeldDown('q', '⌘', {repeat: false})
  ])
}

const ruleApp = () => {
  return rule('Control').manipulators([
    withCondition(ifApp(['^com\\.google\\.Chrome$', '^org\\.mozilla\\.firefox$']))([
      map('j', '⌘').to('tab', '⌃'),
      map('k', '⌘').to('tab', ['⌃', '⇧']),
    ]),
    withCondition(ifApp(['^com\\.apple\\.finder$', '^com\\.cocoatech\\.PathFinder$']))([
      map('j', '⌘').to('close_bracket', ['⌘', '⇧']),
      map('k', '⌘').to('open_bracket', ['⌘', '⇧']),
      map('n', '⌃').to('down_arrow'),
      map('p', '⌃').to('up_arrow'),
      map('b', '⌃').to('left_arrow'),
      map('f', '⌃').to('right_arrow'),
    ])
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
    map('f16').to('japanese_kana').toVar(vimVisualMode).toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey), // for QMK
    map('escape').to('japanese_eisuu').toVar(vimVisualMode).toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey), // for QMK
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
  return duoLayer('j', 'k', vimLayerKey).threshold(100)
    .toIfActivated(toKey("japanese_eisuu"))
    .toIfActivated(toSetVar(vimVisualMode, 0))
    .condition(ifApp(jetJrainsApp).unless())
    .leaderMode({sticky: true})
    .notification('Normal Mode')
    .manipulators([
      map('a').to('→').toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey),
      map('i').toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey),
      map('o').to('e', 'left_control').to('return_or_enter').toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey),
      map('o', '⇧').to('a', 'left_control').to('return_or_enter').to('↑').toVar(vimLayerKey, 0).toRemoveNotificationMessage(vimNoticeKey),
      map('u').to('z', '⌘'),
      map('x').toVar(vimVisualMode, 0).to('⌦'),
      map('x', '⇧').toVar(vimVisualMode, 0).to('⌫'),
      map('p').to('v', '⌘').toVar(vimVisualMode, 0),
      map('d', '⇧').to('e', '⌃⇧').to('c', 'left_command').to('delete_or_backspace').toVar(vimVisualMode, 0),
      map("r", '⌃').to("z", ['⇧', '⌘']),
      map("u", '⌃').to('up_arrow', ['⌥']),
      map("d", '⌃').to('down_arrow', ['⌥']),
      map("g", '⇧').to('up_arrow', ['⌘']),
      mapDoubleTap('g').to('down_arrow', '⌘'),
      withCondition(ifVar(vimVisualMode, 0))([
        map('h').to('←'),
        map('j').to('↓'),
        map('k').to('↑'),
        map('l').to('→'),
        map("w").to('right_arrow', ['⌥']),
        map("b").to('left_arrow', ['⌥']),
        mapDoubleTap('v', 150).toVar(vimVisualMode, 1).to('a', '⌃').to('e', '⌃⇧').singleTap(toSetVar(vimVisualMode, 1)),
        mapDoubleTap('y').to('a', '⌃').to('e', '⌃⇧').to('c', '⌘'),
        mapDoubleTap('d').to('a', '⌃').to('e', '⌃⇧').to('c', 'left_command').to('delete_or_backspace').to('delete_or_backspace').toVar(vimVisualMode, 0),
      ]),
      withCondition(ifVar(vimVisualMode, 1))([
        mapSimultaneous(['k', 'j']).toVar(vimVisualMode, 0).to('←'),
        map('v').toVar(vimVisualMode, 0).to('←'),
        map('h').to('←', '⇧'),
        map('j').to('↓', '⇧'),
        map('k').to('↑', '⇧'),
        map('l').to('→', '⇧'),
        map('d').to('c', 'left_command').to('delete_or_backspace').toVar(vimVisualMode, 0),
        map('y').to('c', 'left_command').toVar(vimVisualMode, 0),
        map("w").to('right_arrow', ['⌥', '⇧']),
        map("b").to('left_arrow', ['⌥', '⇧']),
      ]),
    ])
}


main();
