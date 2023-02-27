import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Vibration,
} from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import Colors from "../../constants/Colors";

const screen = Dimensions.get("window");

interface TimerComponentProps {
  timeInSeconds?: number;
}

export const TimerComponent: React.FC<TimerComponentProps> = ({
  timeInSeconds = 5,
}) => {
  const [remaningSeconds, setRemainingSeconds] = React.useState(timeInSeconds);
  const [isActive, setIsActive] = React.useState(false);
  const [sound, setSound] = React.useState<Audio.Sound | undefined>(undefined);
  const [shouldCount, setShouldCount] = React.useState(false);
  const [counter, setCounter] = React.useState(3);

  const { minutes, seconds } = React.useMemo(() => {
    const minutes = Math.floor(remaningSeconds / 60);
    const seconds = remaningSeconds % 60;
    return { minutes, seconds };
  }, [remaningSeconds]);

  async function mountSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/audio/AlarmClock_01.mp3")
      );
      setSound(sound);
    } catch (error) {
      console.error(error);
    }
  }

  async function playWhistle() {
    if (sound) {
      try {
        await sound.playAsync();
        sound.setPositionAsync(0);
      } catch (error) {
        console.error(error);
      }
    }
  }

  const endTimer = async () => {
    try {
      await playWhistle();
      setIsActive(false);
    } catch (error) {
      console.error(error);
    }
  };

  const startCounter = async () => {
    await mountSound();
    setShouldCount(true);
  };

  React.useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
      playThroughEarpieceAndroid: true,
    });
  }, []);

  React.useEffect(() => {
    let counterInterval: NodeJS.Timer | undefined = undefined;
    if (shouldCount) {
      counterInterval = setInterval(() => {
        try {
          if (counter === 1) {
            setCounter((counter) => counter - 1);
          }

          if (counter > 1) {
            playWhistle();
            setCounter((counter) => counter - 1);
          } else {
            // Plays the whistle sound and vibrates the device
            playWhistle();
            Vibration.vibrate();

            // Restarts the counter
            setCounter(3);
            setShouldCount(false);

            // Starts the timer
            setIsActive(true);

            // Stops the counter
            clearInterval(counterInterval);
          }
        } catch (error) {
          console.error(error);
        }
      }, 1000);
    } else if (!shouldCount && counter !== 0) {
      clearInterval(counterInterval);
    }

    return () => clearInterval(counterInterval);
  }, [shouldCount, counter]);

  React.useEffect(() => {
    let timerInterval: NodeJS.Timer | undefined = undefined;
    if (isActive) {
      timerInterval = setInterval(() => {
        if (remaningSeconds === 1) {
          setRemainingSeconds((remaningSeconds) => remaningSeconds - 1);
        }
        if (remaningSeconds > 1) {
          setRemainingSeconds((remaningSeconds) => remaningSeconds - 1);
        } else {
          Vibration.vibrate();
          endTimer();
          setRemainingSeconds(timeInSeconds);
        }
      }, 1000);
    } else if (!isActive && remaningSeconds === 0) {
      setRemainingSeconds(timeInSeconds);
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [isActive, remaningSeconds]);

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
          setSound(undefined);
        }
      : undefined;
  }, [sound]);

  const parseTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.timerText}>{`${parseTime(minutes)}:${parseTime(
        seconds
      )}`}</Text>
      <TouchableOpacity onPress={startCounter} style={styles.button}>
        <Text style={styles.buttonText}>{isActive ? "Pause" : "Start"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderWidth: 10,
    borderColor: Colors.light.primary,
    width: screen.width / 2,
    height: screen.width / 2,
    borderRadius: screen.width / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.light.primary,
    fontSize: 20,
  },
  timerText: {
    color: Colors.light.text,
    fontSize: 90,
  },
});
