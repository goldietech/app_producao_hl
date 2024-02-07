import React, {useState, useEffect} from 'react';
import {View, Alert, Dimensions, FlatList} from 'react-native';
import styled from 'styled-components/native';
import {BackGroundComponent} from '../components/BackGroundComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
import {ButtonDefault} from '../components/ButtonDefault';

const Connection: React.FC = ({navigation}) => {
  // STORAGE
  const setItem = async (item: String): Promise<any> => {
    return await AsyncStorage.setItem('@user:devices', JSON.stringify(item));
  };

  const getItem = async (): Promise<string> => {
    return await AsyncStorage.getItem('@user:devices').then(json => {
      let res: string = JSON.parse(json);
      return res;
    });
  };

  useEffect(() => {
    const init = async () => {
      let isActive = await BluetoothSerial.enable();
      if (!isActive) {
        await BluetoothSerial.requestEnable();
      }
      let list = await BluetoothSerial.list();
      setDevices(list);
    };

    const getListSaved = async () => {
      let exists = await getItem();
      setDeviceConnected(exists);
    };
    getListSaved();
    init();
  }, []);

  const [devices, setDevices] = useState<any>([]);
  const [deviceConnected, setDeviceConnected] = useState<string>('');
  const [active, setActive] = useState('');

  const confirmConnection = id => {
    setItem(id);
  };

  return (
    <BackGroundComponent>
      <Container>
        <Text>Lista de dispositivos</Text>

        <FlatList
          style={{height: 250}}
          data={devices}
          renderItem={({item, index}) => (
            <DescriptionWrapper
              active={item.id == active || item.id == deviceConnected}
              onPress={() => setActive(item.id)}>
              <Description>{item.name}</Description>
            </DescriptionWrapper>
          )}
        />

        <RowBtns>
          <ButtonDefault
            text="Conectar"
            onPress={() => {
              if (active == '') {
                alert('Não foi selecionado nenhum dispositivo!');
              } else {
                confirmConnection(active);
              }
            }}
          />
        </RowBtns>
      </Container>
    </BackGroundComponent>
  );
};

const Container = styled.View`
  ${Dimensions.get('screen').width < 520 && 'flex: 1'};
  ${Dimensions.get('screen').width > 520 && 'width: 600px'};
  background-color: ${({theme}) => theme.cardBackGround};
  border-radius: 20px;
  padding: ${Dimensions.get('screen').width < 520 ? '16px 8px' : '16px 56px'};
  align-self: center;
`;

const Text = styled.Text`
  font-size: 32px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
  margin: 16px 0;
`;

type BtnActiveProp = {
  active: boolean;
};
const DescriptionWrapper = styled.TouchableOpacity<BtnActiveProp>`
  width: 100%;
  padding: 16px;
  border: 1px solid #fff;
  border-radius: 8px;
  justify-content: center;
  margin: 4px 0;
  background-color: ${({theme, active}) =>
    active ? theme.green : theme.cardBackGround};
`;

const Description = styled.Text`
  color: ${({theme}) => theme.color};
`;

const RowBtns = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const BtnWrapper = styled.View`
  width: ${Dimensions.get('screen').width < 520 ? '42%' : '40%'};
  margin: ${Dimensions.get('screen').width < 520 ? '0 18px' : '0 16px'};
`;

export {Connection};
