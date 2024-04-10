import React, {useState} from 'react';
import {View, Alert, ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {BackGroundComponent} from '../components/BackGroundComponent';
import themes from '../themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import {Apis} from '../services/api';

const Configuration: React.FC = ({navigation}) => {
  const [theme, setTheme] = useState('');

  const setStorage = async () => {
    await AsyncStorage.setItem('@theme:theme', JSON.stringify(theme));
    setTimeout(() => {
      RNRestart.Restart();
    }, 500);
  };

  const changeTheme = () => {
    Alert.alert(
      'Deseja modificar o tema?',
      '',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {text: 'OK', onPress: () => setStorage()},
      ],
      {cancelable: true},
    );
  };

  const clearStorage = async () => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    const turnOffAll = await Apis.apiPlugin.post(
      `${token}/production_orders/ControlStatusProduction/ControlStatusProductionApi/turnOffAll`,
      {
        orderId: 1,
      },
    );
    AsyncStorage.clear();
    setTimeout(() => {
      navigation.navigate('Login');
    }, 200);
  };

  return (
    <BackGroundComponent>
      <ScrollView>
        <Container>
          <BtnThemeChange
            style={{backgroundColor: themes.dark.cardBackGround}}
            onPress={() => setTheme('dark')}>
            <BtnThemeChangeText>Tema escuro</BtnThemeChangeText>
          </BtnThemeChange>

          <BtnThemeChange
            style={{backgroundColor: themes.light.cardBackGround}}
            onPress={() => setTheme('light')}>
            <BtnThemeChangeText style={{color: themes.light.color}}>
              Tema claro
            </BtnThemeChangeText>
          </BtnThemeChange>

          <BtnThemeChange
            style={{backgroundColor: themes.orange.primary}}
            onPress={() => setTheme('orange')}>
            <BtnThemeChangeText>Tema laranja claro</BtnThemeChangeText>
          </BtnThemeChange>

          <BtnThemeChange
            style={{backgroundColor: themes.darkOrange.primary}}
            onPress={() => setTheme('darkOrange')}>
            <BtnThemeChangeText>Tema laranja escuro</BtnThemeChangeText>
          </BtnThemeChange>

          <BtnConfirm
            disabled={theme == ''}
            active={theme != ''}
            onPress={() => changeTheme()}>
            <BtnConfirmText>Confirmar</BtnConfirmText>
          </BtnConfirm>

          <BtnConfirm onPress={() => clearStorage()}>
            <BtnConfirmText>Deslogar</BtnConfirmText>
          </BtnConfirm>
        </Container>
      </ScrollView>
    </BackGroundComponent>
  );
};

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const BtnThemeChange = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  margin: 26px 0;
  border-radius: 15px;
  padding: 16px;
`;

const BtnThemeChangeText = styled.Text`
  color: ${({theme}) => theme.color};
`;

interface ConfirmPropp {
  active: boolean;
}

const BtnConfirm = styled.TouchableOpacity<ConfirmPropp>`
  justify-content: center;
  align-items: center;
  margin: 50px 0;
  border-radius: 15px;
  padding: 26px 16px;
  background-color: ${({theme, active}) =>
    active ? theme.primary : theme.cardBackGround};
  width: 200px;
`;

const BtnConfirmText = styled.Text`
  color: ${({theme}) => theme.color};
`;

export {Configuration};
