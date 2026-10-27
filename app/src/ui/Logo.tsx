import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

// Same artwork as scripts/make-icons.js (the master); keep the two in step.
const DROP = 'M641 520 C 612 580 557 648 557 722 A 93 93 0 0 0 743 722 C 743 650 672 580 641 520 Z';
const LINE =
  'M645 253 C 686 286 706 340 688 378 C 660 440 570 470 500 512 C 430 555 414 620 428 668 ' +
  'C 445 730 520 790 580 825 C 625 850 638 890 641 934 ' +
  'C 632 884 620 858 576 828 C 512 790 440 735 424 668 C 412 620 432 556 504 516 ' +
  'C 576 476 668 446 696 380 C 712 340 690 290 645 253 Z';
const SPARKLE = 'M761 438 Q 768 474 804 481 Q 768 488 761 526 Q 754 488 718 481 Q 754 474 761 438 Z';
const ARC =
  'M888 525 C 932 610 936 720 882 810 C 822 902 722 956 610 953 C 520 949 430 902 368 818 ' +
  'C 436 886 526 938 612 940 C 714 942 808 890 864 806 C 916 726 912 612 888 525 Z';

/** The app logo (drop, flowing line, sparkle, crescent). Brand colours, same in light and dark. */
export function Logo({ size = 96 }: { size?: number }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="App logo" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="340 225 620 760">
        <Defs>
          <LinearGradient id="drop" gradientUnits="userSpaceOnUse" x1="740" y1="600" x2="585" y2="800">
            <Stop offset="0" stopColor="#EE6F7B" />
            <Stop offset="0.55" stopColor="#C13348" />
            <Stop offset="1" stopColor="#951F36" />
          </LinearGradient>
          <LinearGradient id="line" gradientUnits="userSpaceOnUse" x1="690" y1="260" x2="640" y2="930">
            <Stop offset="0" stopColor="#C4445A" />
            <Stop offset="0.5" stopColor="#A5273F" />
            <Stop offset="1" stopColor="#9C2640" />
          </LinearGradient>
          <LinearGradient id="arc" gradientUnits="userSpaceOnUse" x1="900" y1="540" x2="380" y2="830">
            <Stop offset="0" stopColor="#E9AFA6" />
            <Stop offset="0.55" stopColor="#CD7D7C" />
            <Stop offset="1" stopColor="#E4A59E" />
          </LinearGradient>
        </Defs>
        <Path d={ARC} fill="url(#arc)" stroke="url(#arc)" strokeWidth={5} strokeLinejoin="round" />
        <Path d={LINE} fill="url(#line)" stroke="url(#line)" strokeWidth={5} strokeLinejoin="round" />
        <Path d={DROP} fill="url(#drop)" />
        <Path d={SPARKLE} fill="#D6485E" />
      </Svg>
    </View>
  );
}
