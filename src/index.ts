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
import {toSymbol} from "./utils";

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
      mapDoubleTap(',').to(toSymbol[':']),
      mapDoubleTap('/').to(toSymbol['-']),
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
    map('q', '⌥').to(toSymbol['!']),
    map('w', '⌥').to(toSymbol['@']),
    map('e', '⌥').to(toSymbol['#']),
    map('r', '⌥').to(toSymbol['$']),
    map('t', '⌥').to(toSymbol['%']),
    map('y', '⌥').to(toSymbol['^']),
    map('u', '⌥').to(toSymbol['&']),
    map('i', '⌥').to(toSymbol['*']),
    map('o', '⌥').to(toSymbol['`']),
    map('p', '⌥').to(toSymbol['~']),

    map('a', '⌥').to(toSymbol['+']),
    mapDoubleTap('s', '⌥').to(toSymbol['<']).singleTap(toKey('9', ['left_shift'])),
    mapDoubleTap('d', '⌥').to(toSymbol['>']).singleTap(toKey('0', ['left_shift'])),
    map('f', '⌥').to(toSymbol['=']),
    map('g', '⌥').to(toSymbol[':']),
    map('h', '⌥').to('←'),
    map('j', '⌥').to('↓'),
    map('k', '⌥').to('↑'),
    map('l', '⌥').to('→'),

    map('z', '⌥').to(toSymbol['|']),
    mapDoubleTap('x', '⌥').to(toSymbol['[']).singleTap(toKey('open_bracket', ['left_shift'])),
    mapDoubleTap('c', '⌥').to(toSymbol[']']).singleTap(toKey('close_bracket', ['left_shift'])),
    map('v', '⌥').to(toSymbol['\'']),
    map('b', '⌥').to(toSymbol['\"']),
    map('n', '⌥').to(toSymbol['\\']),
    map('m', '⌥').to(toSymbol['_']),
    map(',', '⌥').to(toSymbol['[']),
    map('.', '⌥').to(toSymbol[']']),
    map('/', '⌥').to(toSymbol['-']),
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
