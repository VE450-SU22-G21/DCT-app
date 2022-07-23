import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { range } from 'lodash';

function ProgressSteps({ children }) {
  const [step, setStep] = useState(0);

  const maxStep = children.length;

  const onNextClick = () => {
    if (step < maxStep - 1) {
      setStep(step + 1);
    }
  };

  const onPreviousClick = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <View>
      {React.cloneElement(children[step], {
        // setActiveStep: this.setActiveStep,
        // activeStep: this.state.activeStep,
        onNextClick,
        maxStep,
        step,
      })}
    </View>
  );
}

function ProgressStep({
  children, onSubmit, onNextClick, maxStep, step, label,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.flexCenter}>
      <ScrollView
        style={{
          height: 550,
        }}
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        {children}
      </ScrollView>
      <View style={styles.stepButtons}>
        {range(maxStep).map((i) => (
          <View
            key={i}
            style={{
              ...styles.stepButton,
              backgroundColor: i <= step ? colors.primary : colors.secondary,
            }}
          />
        ))}
      </View>
      <Button
        mode="contained"
        onPress={() => {
          if (onSubmit) onSubmit();
          onNextClick();
        }}
        style={styles.nextButton}
        contentStyle={styles.nextButtonContent}
      >
        {label}
      </Button>

    </View>
  );
}
ProgressStep.defaultProps = {
  onSubmit: null,
  label: 'Next',
};

const styles = StyleSheet.create({
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtons: {
    height: 30,
    width: 100,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepButton: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  center: {
    textAlign: 'center',
  },
  progressStepViewItem: {
    marginTop: 30,
  },
  nextButton: {
    borderRadius: 100,
  },
  nextButtonContent: {
    width: 178,
    height: 56,
  },
});

export { ProgressStep, ProgressSteps };
