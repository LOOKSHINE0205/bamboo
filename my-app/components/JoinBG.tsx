import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

type JoinBGProps = {
  children: React.ReactNode;
};

export default function JoinBG({ children }: JoinBGProps) {
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const handleResize = () => setScreenDimensions(Dimensions.get('window'));

    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => {
      subscription?.remove();
    };
  }, []);

  const { width, height } = screenDimensions;

  return (
    <View style={styles.container}>
      <Svg style={styles.svg}>
        <Defs>
          <RadialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#6bff6e" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#6bff6e" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#6bdaff" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#6bdaff" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad4" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#eeff6b" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#eeff6b" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx={width * 0.5} cy={height * 0.25} r={width * 0.4} fill="url(#grad1)" />
        <Circle cx={width * 0.85} cy={height * 0.4} r={width * 0.4} fill="url(#grad2)" />
        <Circle cx={width * 0.5} cy={height * 0.55} r={width * 0.35} fill="url(#grad3)" />
        <Circle cx={width * 0.2} cy={height * 0.4} r={width * 0.4} fill="url(#grad4)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
