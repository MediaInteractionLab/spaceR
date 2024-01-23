/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Media Interaction Lab
 *  Licensed under the MIT License. See LICENSE file for license information.
 *  Author: Roland Aigner | roland.aigner@fh-hagenberg.at
 *  This code is part of the supplementary material of the paper 
 *  Aigner, R., Haberfellner, M.A., Haller, M. "spaceR: Knitting Ready-Made, Tactile, and 
 *    Highly Responsive Spacer-Fabric Force Sensors for Continuous Input". In ACM UIST'22.  
 *    https://doi.org/10.1145/3526113.3545694
 *--------------------------------------------------------------------------------------------*/

#include <Arduino.h>

const int ANALOG_IN_COUNT = 4;

const int ANALOG_INS[] = {
  A0, A1, A2, A3
};

const int VCCS[] = {
  A6, A7, A8, A9
};

//specify your ADC resolution here
#define ADC_MAX     ((0x01 << 12) - 1)

//specify your voltage divider's reference resistor ohmage here
uint32_t R_ref = 606000;

//specify your reference voltage here
float V_ref = 3.268;

void setup()
{
  Serial.begin(115200);

  for(int i = 0; i < ANALOG_IN_COUNT; i++) {
    pinMode(ANALOG_INS[i], INPUT);
    pinMode(VCCS[i], INPUT);
  }
}

float sample(int id, int msT)
{
  static float s = 1.0f / ADC_MAX;

  unsigned long startMS = millis();

  pinMode(VCCS[id], OUTPUT);
  digitalWrite(VCCS[id], HIGH);
  delayMicroseconds(100);

  int cntr = 0;
  uint32_t sum = 0;
  do{
    sum += analogRead(ANALOG_INS[id]);
    cntr++;
  }while(millis() - startMS < msT);

  pinMode(VCCS[id], INPUT);

  return (float)sum / cntr * s;
}

void loop()
{
  float f[ANALOG_IN_COUNT];
  for(int i = 0; i < ANALOG_IN_COUNT; i++) {
    f[i] = sample(i, 3);
  }

  for(int i = 0; i < ANALOG_IN_COUNT; i++) {
    Serial.printf("%f ", f[i]);
  }
  Serial.print("\n");
}
