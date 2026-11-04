/**
 * Every word the app says, in English. Hindi (hi.ts) must have exactly the same keys: the compiler
 * checks the shape and a test checks the text. Screens contain no literal text.
 *
 * Rules (docs/context/ux-standards.md): class 8 reading level, everyday words, calm and personal
 * (the Saathi talks), buttons say what will happen, every input has an example, no blame, guesses are
 * called guesses. Anything about health is NEEDS DRASHTI REVIEW (printed in the review sheet).
 */
import type { Phase } from '../domain/types';

export const en = {
  appName: 'Cycle Saathi',
  languageName: 'English',

  common: {
    cancel: 'Cancel',
    save: 'Save',
    remove: 'Remove',
    undo: 'Undo',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    done: 'Done',
    gotIt: 'Got it',
    change: 'Change',
    today: 'Today',
    yesterday: 'Yesterday',
    todayLower: 'today',
    yesterdayLower: 'yesterday',
    settings: 'Settings',
    loading: 'Just a moment…',
    days: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
  },

  dates: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    initials: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    previousMonth: 'Month before',
    nextMonth: 'Month after',
    pickDay: 'Pick a day',
  },

  nav: { today: 'Today', calendar: 'Calendar', cycles: 'My cycles' },

  phases: {
    names: { menstrual: 'Menstrual', follicular: 'Follicular', ovulation: 'Ovulation', luteal: 'Luteal' } as Record<Phase, string>,
    /** One plain line under the phase name. NEEDS DRASHTI REVIEW. */
    meaning: {
      menstrual: 'Your period days',
      follicular: 'Your body is getting ready to release an egg',
      ovulation: 'An egg may be released around now (this is a guess)',
      luteal: 'Your body is waiting for your next period',
    } as Record<Phase, string>,
    /** What the Saathi says for each phase. NEEDS DRASHTI REVIEW. */
    guide: {
      menstrual: 'Your period is here. Be kind to yourself today.',
      follicular: 'Your body is getting ready for ovulation. Many women feel more energetic now.',
      ovulation: 'Ovulation is likely around now. This is only my best guess.',
      luteal: 'Your next period is getting closer. Some women feel tired or moody around now. That is normal.',
    } as Record<Phase, string>,
    fertileDays: 'Fertile days',
    expectedPeriod: 'Expected period',
  },

  guide: {
    /** Short, friendly lines from the Saathi. `name` is what she asked to be called. */
    periodGoingOn: (name: string | null) => `Your period is here${name ? `, ${name}` : ''}. Be kind to yourself today. Tell me when it ends.`,
    unfinished: (name: string | null, days: number) =>
      `${name ? `${name}, ` : ''}your period started ${days} days ago and I have not heard that it ended. Tell me the day it ended.`,
    typical: (name: string | null, days: number) =>
      `${name ? `${name}, ` : ''}I do not know your own cycle yet, so I am using a typical ${days}-day cycle. Tell me about your next periods and I will learn yours.`,
    late: 'Your period is a little late. This can happen. If you are worried, please talk to your doctor.',
    askFirstPeriod: (name: string | null) => `${name ? `Hi ${name}!` : 'Hi!'} Tell me the day your last period started. I will learn from it.`,
  },

  welcome: {
    title: 'Welcome to Cycle Saathi',
    intro: 'I am your Saathi, your friend. I help you understand your cycle, and I guess when your next period may come.',
    privateTitle: 'Only on your phone',
    privateBody: 'Everything you tell me stays on this phone. There is no account and nothing is sent anywhere.',
    guessTitle: 'Guesses, not advice',
    guessBody: 'These are only guesses. I cannot tell you if something is wrong, and I am not a way to prevent pregnancy. If you are worried, please talk to your doctor.',
    start: 'Get started',
    nameTitle: 'What should I call you?',
    nameLabel: 'Your name',
    nameExample: 'e.g. Drashti',
    nameWhy: 'So I can say hello by name. You can change it later in Settings.',
    nameContinue: 'Continue',
    lastTitle: 'When did your last period start?',
    lastBody: 'Tell me the first day. A rough day is fine: you can change it later.',
    lastAction: 'Choose the day',
    lastSkip: 'I will do it later',
    tourTitle: 'Want a quick tour?',
    tourBody: 'It takes about a minute. You can see it again any time in Settings.',
    tourYes: 'Show me around',
    tourNo: 'No, thank you',
  },

  today: {
    greeting: (name: string | null) => (name ? `Hi, ${name}` : 'Hi'),
    dayOfCycle: (n: number) => `Day ${n}`,
    ofYourCycle: 'of your cycle',
    day1Hint: 'Day 1 is the first day of your period.',
    periodDay: (n: number) => `Period day ${n}`,
    nextTitle: 'Your next period',
    nextRange: (range: string) => `Likely between ${range}`,
    basisOwn: (cycles: number, avg: number) => `I looked at your last ${cycles} ${cycles === 1 ? 'cycle' : 'cycles'}. They were about ${avg} days long.`,
    basisTypical: (days: number) => `Based on a typical ${days}-day cycle. I will learn yours as you add periods.`,
    estimateTag: 'Estimate',
    typicalTag: 'Typical cycle',
    ovulationAround: (date: string) => `Ovulation is likely around ${date} (a guess)`,
    unfinishedTitle: 'Did your period end?',
    unfinishedBody: (date: string) => `You told me it started on ${date}.`,
    unfinishedAction: 'Tell me the end day',
    fab: { first: 'Add my last period', start: 'Period started', end: 'Period ended' },
    fabHelp: { first: 'Add the day your last period started', start: 'Tell me a period has started', end: 'Tell me your period has ended' },
    disclaimer: 'Guesses only. Not medical advice, and not birth control.',
  },

  tell: {
    title: 'Tell me',
    modes: { start: 'Period started', end: 'Period ended', note: 'Just a note' },
    whichDay: 'Which day?',
    noteLabel: 'A note (optional)',
    noteLabelOnly: 'Your note',
    notePlaceholder: 'e.g. cramps, travelling, took medicine',
    noteCount: (n: number, max: number) => `${n} of ${max}`,
    save: {
      start: (date: string) => `Save: period started ${date}`,
      end: (date: string) => `Save: period ended ${date}`,
      note: (date: string) => `Save note for ${date}`,
    },
    toast: {
      start: (date: string) => `Saved: period started ${date}`,
      end: (date: string) => `Saved: period ended ${date}`,
      note: 'Note saved',
      noteRemoved: 'Note removed',
      periodRemoved: 'Period removed',
      periodChanged: 'Period changed',
    },
    removeNote: 'Remove my note for this day',
    noteHere: 'Your note for this day',
    couldNotSave: 'I could not save that. Your phone may be full. Please try again.',
  },

  /** What the app says when something she tells it does not fit. Calm, with the next step. */
  issues: {
    futureDate: { title: 'That day has not come yet', body: 'Please pick today or an earlier day.' },
    startAlreadyLogged: { title: (date: string) => `A period already starts on ${date}`, body: 'You have already told me about it.', action: 'Change that period' },
    startInsidePeriod: { title: (range: string) => `That day is inside your period (${range})`, body: 'A new period cannot start while one is going on.', action: 'Change that period' },
    startPreviousUnfinished: {
      title: (date: string) => `Your period from ${date} has not ended`,
      body: 'Tell me when it ended first. Then you can add the new one.',
      action: 'Tell me the end day',
    },
    startOverlapsNext: { title: (date: string) => `This runs into your period that starts on ${date}`, body: 'Please pick an earlier day.' },
    startTooSoon: {
      title: (days: number) => `Only ${days} days after another period started`,
      body: (min: number, max: number) => `Most cycles are ${min} to ${max} days long. Is this a new period?`,
      yes: 'Yes, save it',
      no: 'No, go back',
    },
    endNoPeriod: { title: 'No period is going on', body: 'Tell me when a period started first.', action: 'Period started' },
    endBeforeStart: { title: (date: string) => `That is before the period started (${date})`, body: 'Please pick a day on or after it.' },
    endAlready: { title: (end: string) => `That period already ended on ${end}`, body: 'You can change its days if that is not right.', action: 'Change that period' },
    endTooLong: { title: (days: number) => `That makes your period ${days} days long`, body: 'Is that right?', yes: 'Yes, save it', no: 'No, go back' },
    overlaps: { title: (range: string) => `This overlaps your period from ${range}`, body: 'Periods cannot overlap. Please check the days.' },
    noteEmpty: { title: 'Write something first', body: 'e.g. cramps, travelling, took medicine' },
    noteTooLong: { title: 'That note is too long', body: (max: number) => `Please keep it under ${max} letters.` },
  },

  /** Calm notes when something looks unusual: never a diagnosis. NEEDS DRASHTI REVIEW. */
  flags: {
    title: 'You may want to tell your doctor',
    cycleShort: (days: number, min: number, max: number) => `Your last cycle was ${days} days. Most cycles are between ${min} and ${max} days.`,
    cycleLong: (days: number, min: number, max: number) => `Your last cycle was ${days} days. Most cycles are between ${min} and ${max} days.`,
    variation: (days: number) => `Your cycles are not always the same length. They changed by ${days} days from the shortest to the longest.`,
    periodLong: (days: number, max: number) => `Your last period lasted ${days} days. Most periods last up to ${max} days.`,
    periodLate: (days: number) => `Your period is ${days} ${days === 1 ? 'day' : 'days'} later than I guessed.`,
  },

  calendar: {
    title: 'Calendar',
    legendTitle: 'Colours',
    legendNote: 'Colours are a guess from a typical cycle until I learn yours.',
    dayNoData: 'I do not have information for this day yet.',
    dayFuture: 'This day has not come yet.',
    typicalNote: 'A guess from a typical cycle',
    fertileDay: 'A fertile day (a guess)',
    ovulationDay: 'Likely ovulation day (a guess)',
    expectedPeriod: 'Your period may start around now (a guess)',
    periodStartedHere: 'Period started this day',
    periodEndedHere: 'Period ended this day',
    changePeriod: 'Change this period',
    addNote: 'Add a note',
    editNote: 'Change my note',
    yourNote: 'Your note',
    selectedDay: (date: string) => `${date}, selected`,
  },

  cycles: {
    title: 'My cycles',
    usual: 'Usual cycle',
    range: 'From–to',
    usualPeriod: 'Usual period',
    chartTitle: 'Your last cycles (days)',
    chartNote: (min: number, max: number) => `Dashed lines show ${min} and ${max} days.`,
    emptyTitle: 'Nothing here yet',
    emptyBody: 'When you tell me about your periods, they will show up here, with how long each cycle was.',
    periodLasted: (n: number) => `Period lasted ${n} ${n === 1 ? 'day' : 'days'}`,
    endNotTold: 'End day not told',
    cycleWas: (n: number) => `Cycle ${n} days`,
    current: 'Current cycle',
    tagShort: 'Shorter than usual',
    tagLong: 'Longer than usual',
    showDoctor: 'You can show this page to your doctor.',
    learning: 'These numbers become your own after a few cycles.',
  },

  change: {
    title: 'Change this period',
    started: 'It started on',
    ended: 'It ended on',
    notEnded: 'It has not ended yet',
    save: 'Save changes',
    remove: 'Remove this period',
    removeTitle: 'Remove this period?',
    removeBody: (range: string) => `${range} will be taken out of your cycles. You can undo this right after.`,
    gone: 'This period is no longer here.',
  },

  settings: {
    title: 'Settings',
    groups: { general: 'General', data: 'Your information', help: 'Help', about: 'About' },
    language: 'Language',
    languageHelp: 'The language of the whole app',
    name: 'Your name',
    nameEmpty: 'Not set',
    nameSheetTitle: 'What should I call you?',
    nameExample: 'e.g. Drashti',
    nameWhy: 'I use it to say hello.',
    howTo: 'How to use Cycle Saathi',
    howToHelp: 'A quick tour with your Saathi',
    saveCopy: 'Save a copy of my information',
    saveCopyHelp: 'A file you can keep in Drive or send to yourself',
    saveSheet: 'Save a spreadsheet',
    saveSheetHelp: 'Your periods in a table, easy to show a doctor',
    bringBack: 'Bring my information back',
    bringBackHelp: 'Choose a copy you saved before',
    privacy: 'Everything stays on this phone. There is no account and nothing is sent anywhere.',
    aboutApp: 'About Cycle Saathi',
    version: 'Version',
    goodToKnow: 'Good to know',
    disclaimer:
      'These are only guesses to help you understand your body. This app cannot tell you if something is wrong, and it cannot stop you getting pregnant. If you are worried, please talk to your doctor.',
    fileReadyTitle: 'Your file is ready',
    fileReadyBody: 'Keep it somewhere safe.',
    fileDownloadedBody: 'Your file was downloaded. Keep it somewhere safe.',
    cantShare: 'This phone could not open the share menu. Please try again.',
    nothingToSave: 'You have not told me about any period yet, so the file will be nearly empty.',
    restoredTitle: 'All done',
    restoredBody: (periods: number, notes: number, skipped: number) =>
      `I added ${periods} ${periods === 1 ? 'period' : 'periods'} and ${notes} ${notes === 1 ? 'note' : 'notes'}.` +
      (skipped > 0 ? ` ${skipped} ${skipped === 1 ? 'item was' : 'items were'} already here, so I kept what you had.` : ''),
    restoreNothingNew: 'Everything in that file is already here, so nothing changed.',
    restoreProblem: {
      notJson: 'That file does not look right. Please choose the file you saved from this app.',
      notBackup: 'That is not a copy saved from this app.',
      tooNew: 'That copy was saved by a newer version of the app. Please update the app first.',
      badData: 'I could not read something in that file, so I did not change anything. Please try another copy.',
    },
    restoreProblemTitle: 'I could not use that file',
  },

  tour: {
    steps: [
      { title: 'Hello, I am your Saathi', body: 'I will show you around in a minute. Everything stays on your phone, and nothing here is advice. It is only guesses to help you understand your body.' },
      { title: 'Today', body: 'This is home. The ring shows where you are in your cycle, and the colours are the parts of your cycle. Under it you see when your next period may come.' },
      { title: 'The big button', body: 'Tap it when your period starts. While a period is going on, it changes to "Period ended". You can also add a note, or tell me about an earlier day.' },
      { title: 'Calendar', body: 'Every day has a colour for its part of the cycle. Tap a day to see more, change a period, or write a note.' },
      { title: 'My cycles', body: 'See how long each cycle and period was. You can show this page to your doctor.' },
      { title: 'Keep your information safe', body: 'In Settings, save a copy of your information, and bring it back on a new phone. You can see this tour again there, and change the language.' },
    ],
    stepOf: (n: number, total: number) => `${n} of ${total}`,
    finish: 'Start using the app',
  },

  a11y: {
    settingsButton: 'Settings',
    closeSheet: 'Close',
    goBack: 'Go back',
    tour: 'Tour',
  },
};

export type Strings = typeof en;
