import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';
import assets from '../services/imagesExports';
import {StackScreenProps} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Apis} from '../services/api';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

type Props = StackScreenProps<RootStackParamList>;

const LoadingScreen: React.FC<Props> = ({navigation}) => {
  useEffect(() => {
    const verifyToken = async () => {
      let asyncToken: Promise<string | null> = await AsyncStorage.getItem(
        '@user:token',
      );
      let token = JSON.parse(asyncToken);
      try {
        const resLogin = await Apis.api.post('/token_check', {
          token: token,
          company: 'hlplast',
        });

        navigation.push('Home');
      } catch (error) {
        navigation.push('Login');
      }
    };

    verifyToken();
  }, []);

  return (
    <Main>
      <ImageLogo resizeMode="contain" source={assets.logoGoldie} />
    </Main>
  );
};
// styles
const Main = styled.View`
  flex: 1;
  background-color: #060b1f;
  justify-content: center;
  align-items: center;
`;

const ImageLogo = styled.Image`
  height: 200px;
  width: 200px;
`;

export {LoadingScreen};
