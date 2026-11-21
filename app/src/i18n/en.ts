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

  ads: { label: 'Ad' },

  nav: { today: 'Today', calendar: 'Calendar', cycles: 'My cycles' },

  phases: {
    names: { menstrual: 'Bleeding', follicular: 'Follicular', ovulation: 'Ovulation', luteal: 'Luteal' } as Record<Phase, string>,
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
      follicular: 'Your body is getting ready for ovulation. Some people feel more energetic around now; many notice nothing.',
      ovulation: 'My guess is that ovulation is around now. It can be off by days or weeks.',
      luteal: 'Your next period is getting closer. Some people feel tired or moody before a period. If it is strong or stops you doing daily things, tell a doctor.',
    } as Record<Phase, string>,
    fertileDays: 'Fertile days',
    expectedPeriod: 'Expected period',
  },

  guide: {
    /** Short, friendly lines from the Saathi. `name` is what she asked to be called. */
    periodGoingOn: (name: string | null) => `Your period is here${name ? `, ${name}` : ''}. Be kind to yourself today.`,
    typical: (name: string | null, days: number) =>
      `${name ? `${name}, ` : ''}I do not know your own cycle yet, so I am using a typical ${days}-day cycle. Tell me about your next periods and I will learn yours.`,
    /** Up to a week after my guess. NEEDS DRASHTI REVIEW. */
    lateFew: 'Your period is a few days late. This can happen.',
    /** More than a week after my guess. NEEDS DRASHTI REVIEW. */
    lateMore: 'Your period is late. If there is any chance you are pregnant, a pregnancy test is a good next step. If it keeps being late, please talk to a doctor.',
    /** No period told to the app for a long time. NEEDS DRASHTI REVIEW. */
    silent: (days: number) => `I have not heard about a period for ${days} days. Did you forget to tell me about one? If not, please see a doctor.`,
    /** When there is no phase to talk about (late, or no ovulation guess). */
    keepLearning: 'I am learning your cycle. Tell me each time a period starts and my guesses will get better.',
    askFirstPeriod: (name: string | null) => `${name ? `Hi ${name}!` : 'Hi!'} Tell me the day your last period started. I will learn from it.`,
  },

  welcome: {
    title: 'Welcome to Cycle Saathi',
    intro: 'I am your Saathi, your friend. I help you understand your cycle, and I guess when your next period may come.',
    privateTitle: 'Only on your phone',
    privateBody: 'Your cycle information stays on this phone. There is no account. Ads come from Google and never get your cycle information.',
    guessTitle: 'Guesses, not advice',
    guessBody: 'These are only guesses. I cannot tell you if something is wrong, and I am not a way to prevent pregnancy. If you are worried, please talk to your doctor.',
    start: 'Get started',
    nameTitle: 'What should I call you?',
    nameLabel: 'Your name',
    nameExample: 'e.g. Drashti',
    nameWhy: 'So I can say hello by name. You can change it later in Settings.',
    nameContinue: 'Continue',
    ageTitle: 'How old are you?',
    ageBody: 'I only use this to fit my notes to you, for example how long a cycle can be and still be common. You can change it later in Settings.',
    lastTitle: 'When did your last period start?',
    lastBody: 'Tell me the first day. A rough day is fine: you can change it later.',
    lastAction: 'Choose the day',
    lastSkip: 'I will do it later',
    lastRough: 'Not sure of the day? Pick a rough day. I will treat it as a guess.',
    lastChips: { today: 'Today', week1: '1 week ago', week2: '2 weeks ago', week3: '3 weeks ago' },
    historyTitle: 'Want to add earlier cycles?',
    historyBody: 'The more cycles I know, the better my guesses. You can also add them later in My cycles.',
    historyYes: 'Add earlier cycles',
    historyNo: 'Not now',
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
    ovulationAround: (date: string) => `My guess is that ovulation is around ${date}. This can be off by days or weeks.`,
    /** Why there is no ovulation guess for her. NEEDS DRASHTI REVIEW. */
    noOvulationVary: 'Your cycles change from month to month, so I do not guess ovulation or fertile days.',
    noOvulationYoung: 'When periods are new they often change from month to month, so I do not guess ovulation or fertile days.',
    fab: { first: 'Add my last period', start: 'Period started' },
    fabHelp: { first: 'Add the day your last period started', start: 'Tell me a period has started' },
    disclaimer: 'Guesses only. Not medical advice, and not birth control.',
    /** The one line Today leads with. */
    headline: {
      periodDay: (n: number) => `Period day ${n}`,
      coming: (from: number, to: number) => (from === to ? `Your period may start in ${from} days` : `Your period may start in ${from} to ${to} days`),
      anyDayNow: 'Your period may start any day now',
      late: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} later than my guess`,
      lateHelpFew: 'This can happen.',
      lateHelpMore: 'If there is any chance you are pregnant, please take a pregnancy test. If it keeps being late, please talk to a doctor.',
      silent: (days: number) => `No period noted for ${days} days`,
      silentHelp: 'Did a period come that I do not know about? Tell me the day it started. If not, and you are worried, please see a doctor.',
      silentButton: 'Tell me about a period',
    },
    remindersOffer: {
      title: 'Want a gentle reminder?',
      body: 'I can remind you before your next period. At most one a day, in the morning.',
      yes: 'Turn on reminders',
      no: 'Not now',
    },
  },

  tell: {
    title: 'Tell me',
    modes: { start: 'Started', note: 'Note' },
    whichDay: 'Which day?',
    noteLabel: 'A note (optional)',
    noteLabelOnly: 'Your note',
    notePlaceholder: 'e.g. cramps, travelling, took medicine',
    noteCount: (n: number, max: number) => `${n} of ${max}`,
    save: {
      start: (date: string) => `Save: period started ${date}`,
      note: (date: string) => `Save note for ${date}`,
    },
    toast: {
      start: (date: string) => `Saved: period started ${date}`,
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
    startTooSoon: {
      title: (days: number) => `Only ${days} days after another period started`,
      body: (min: number, max: number) => `Most cycles are ${min} to ${max} days long. Is this a new period?`,
      yes: 'Yes, save it',
      no: 'No, go back',
    },
    startLongGap: {
      title: (days: number) => `${days} days from the closest period I know about`,
      body: 'A cycle can be missed or late (illness, stress, pregnancy, some medicines). Is that right?',
      yes: 'Yes, save it',
      no: 'No, go back',
    },
    startTooOld: { title: 'That day is too long ago', body: (years: number) => `A start more than ${years} ${years === 1 ? 'year' : 'years'} ago would not help my guesses. Please pick a later day.` },
    noteEmpty: { title: 'Write something first', body: 'e.g. cramps, travelling, took medicine' },
    noteTooLong: { title: 'That note is too long', body: (max: number) => `Please keep it under ${max} letters.` },
  },

  /** Calm notes when something looks unusual: never a diagnosis. NEEDS DRASHTI REVIEW. */
  flags: {
    title: 'You may want to tell your doctor',
    cycleShort: (days: number, min: number, max: number) => `Your last cycle was ${days} days. Most adults have cycles between ${min} and ${max} days.`,
    cycleLong: (days: number, min: number, max: number) => `Your last cycle was ${days} days. Most adults have cycles between ${min} and ${max} days.`,
    cycleLongYoung: (days: number, max: number) => `Your last cycle was ${days} days. When periods are new, cycles up to about ${max} days are common. If they stay this long after your first 2 to 3 years of periods, or you are worried, tell a doctor.`,
    over40Note: 'Cycles often change in your 40s. It is still worth mentioning to a doctor.',
    variation: (days: number) => `Your cycles are not always the same length. They changed by ${days} days from the shortest to the longest.`,
    periodLate: (days: number) => `Your period is ${days} ${days === 1 ? 'day' : 'days'} later than I guessed.`,
  },

  calendar: {
    title: 'Calendar',
    legendTitle: 'Colours',
    startMarker: 'The drop marks the day a new cycle started.',
    legendNote: 'Colours are a guess from a typical cycle until I learn yours.',
    dayNoData: 'I do not have information for this day yet.',
    dayFuture: 'This day has not come yet.',
    typicalNote: 'A guess from a typical cycle',
    fertileDay: 'A fertile day (a guess)',
    ovulationDay: 'Likely ovulation day (a guess)',
    expectedPeriod: 'Your period may start around now (a guess)',
    dayOfCycle: (n: number) => `Day ${n} of your cycle`,
    cycleStarts: 'A new cycle started this day',
    periodStartedHere: 'Period started this day',
    changePeriod: 'Change this period',
    addNote: 'Add a note',
    editNote: 'Change my note',
    yourNote: 'Your note',
    selectedDay: (date: string) => `${date}, selected`,
  },

  /** Adding earlier cycles (history). */
  history: {
    title: 'Earlier cycles',
    intro: 'Add the day each earlier period started. A rough day is fine.',
    cycleN: (n: number) => `Cycle ${n}`,
    started: 'It started on',
    addAnother: 'Add another cycle',
    removeRow: 'Remove this row',
    save: (n: number) => `Save ${n} ${n === 1 ? 'cycle' : 'cycles'}`,
    toast: (n: number) => `Saved ${n} ${n === 1 ? 'cycle' : 'cycles'}`,
    addButton: 'Add earlier cycles',
    problemIn: (n: number, title: string) => `Cycle ${n}: ${title}`,
  },

  cycles: {
    title: 'My cycles',
    usual: 'Typical cycle (middle value)',
    range: 'From–to',
    chartTitle: 'Your last cycles (days)',
    chartNote: (min: number, max: number) => `Dashed lines show ${min} and ${max} days.`,
    emptyTitle: 'Nothing here yet',
    emptyBody: 'When you tell me about your periods, they will show up here, with how long each cycle was.',
    cycleWas: (n: number) => `Cycle ${n} days`,
    current: 'Current cycle',
    currentDay: (n: number) => `Day ${n} so far`,
    tagShort: 'Shorter than usual',
    tagLong: 'Longer than usual',
    tagGap: 'Long gap',
    showDoctor: 'You can show this page to your doctor.',
    learning: 'These numbers become your own after a few cycles.',
  },

  change: {
    title: 'Change this period',
    started: 'It started on',
    save: 'Save changes',
    remove: 'Remove this period',
    removeTitle: 'Remove this period?',
    removeBody: (range: string) => `${range} will be taken out of your cycles. You can undo this right after.`,
    gone: 'This period is no longer here.',
  },

  settings: {
    title: 'Settings',
    groups: { general: 'General', reminders: 'Reminders', data: 'Your information', help: 'Help', about: 'About' },
    language: 'Language',
    languageHelp: 'The language of the whole app',
    name: 'Your name',
    nameEmpty: 'Not set',
    nameSheetTitle: 'What should I call you?',
    nameExample: 'e.g. Drashti',
    nameWhy: 'I use it to say hello.',
    reminders: {
      master: 'Gentle reminders',
      masterHelp: 'A short note from your Saathi, at most one a day, in the morning',
      details: 'Show details on the lock screen',
      detailsHelp: 'Off: it only says "A note from your Saathi"',
      kinds: {
        coming: { title: 'Before your period', help: 'A heads-up 2 days before' },
        did_start: { title: 'Did it start?', help: 'On the days it may start' },
        late: { title: 'Later than my guess', help: 'Once, a day after my guess' },
        backup: { title: 'Save a copy', help: 'About once a month' },
        quiet: { title: 'Tell me about your last period', help: 'If I have heard nothing for 40 days' },
      },
      blockedTitle: 'Reminders are off on this phone',
      blockedBody: 'Please allow notifications for Cycle Saathi in your phone settings, then try again.',
    },
    ageGroup: {
      title: 'Your age group',
      help: 'So my notes fit you',
      notSet: 'Not set',
      sheetTitle: 'How old are you?',
      sheetWhy: 'I only use this to fit my notes to you, for example how long a cycle can be and still be common.',
      options: { under20: 'Under 20', adult: '20 to 39', over40: '40 and over' },
      optionHelp: { under20: 'Periods are often not regular in the first years', adult: 'The usual guide for adults', over40: 'Cycles often change at this age' },
    },
    howTo: 'How to use Cycle Saathi',
    howToHelp: 'A quick tour with your Saathi',
    saveCopy: 'Save a copy of my information',
    saveCopyHelp: 'A file you can keep in Drive or send to yourself',
    saveSheet: 'Save a PDF report',
    saveSheetHelp: 'Your cycles on a neat page, easy to show a doctor',
    bringBack: 'Bring my information back',
    bringBackHelp: 'Choose a copy you saved before',
    privacy: 'Your cycle information stays on this phone. There is no account. Ads come from Google and never get your cycle information.',
    aboutApp: 'About Cycle Saathi',
    version: 'Version',
    goodToKnow: 'Good to know',
    goodToKnowHelp: 'What this app can and cannot do',
    disclaimer:
      'These are only guesses to help you understand your body. This app cannot tell you if something is wrong, and it cannot stop you getting pregnant. If you are worried, please talk to your doctor.',
    fileReadyTitle: 'Your file is ready',
    fileReadyBody: 'Keep it somewhere safe.',
    fileDownloadedBody: 'Your file was downloaded. Keep it somewhere safe.',
    cantShare: 'This phone could not open the share menu. Please try again.',
    nothingToSave: 'You have not told me about any period yet, so the report will be nearly empty.',
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

  /** What the phone shows when a reminder arrives. Kept short and calm. NEEDS DRASHTI REVIEW. */
  notify: {
    channel: 'Reminders',
    discreetTitle: 'Cycle Saathi',
    discreetBody: 'A note from your Saathi',
    details: {
      coming: { title: 'Your period may be close', body: 'It may start in the next few days.' },
      did_start: { title: 'Did your period start?', body: 'Tap to tell me.' },
      late: { title: 'Later than my guess', body: 'That can happen. Tap to see.' },
      backup: { title: 'Save a copy of your information', body: 'So it is never lost.' },
      quiet: { title: 'Tell me about your last period', body: 'So my guesses stay right.' },
    },
  },

  /** The PDF report she can show a doctor. */
  report: {
    title: 'My cycle report',
    forName: (name: string) => `For ${name}`,
    madeOn: (date: string) => `Made on ${date}`,
    summary: 'Summary',
    usualCycle: 'Typical cycle (middle value)',
    range: 'Shortest to longest',
    cyclesNoted: 'Cycles noted',
    history: 'Cycle history',
    colPeriod: 'Period',
    colCycle: 'Cycle length',
    colNote: 'Note',
    current: 'Current cycle',
    empty: 'No periods have been noted yet.',
    footer: 'Made with Cycle Saathi from what she entered herself. These are records and guesses, not a diagnosis. Please talk to a doctor about any worry.',
    fileName: (date: string) => `cycle-report-${date}.pdf`,
  },

  tour: {
    steps: [
      { title: 'Hello, I am your Saathi', body: 'I will show you around in a minute. Everything stays on your phone, and nothing here is advice. It is only guesses to help you understand your body.' },
      { title: 'Today', body: 'This is home. The ring shows where you are in your cycle, and the colours are the parts of your cycle. Under it you see when your next period may come.' },
      { title: 'The big button', body: 'Tap it on the day your period starts. A new cycle begins that day, and the one before ends. You can also add a note, or tell me about an earlier day.' },
      { title: 'Calendar', body: 'Every day has a colour for its part of the cycle. Tap a day to see more, change a period, or write a note.' },
      { title: 'My cycles', body: 'See how long each cycle was. You can show this page to your doctor.' },
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
