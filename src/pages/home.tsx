import React, {useEffect, useState} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import assets from '../services/imagesExports';
import {CardSelectionWithIlustration} from '../components/CardSelectionWithIlustration';
import styled from 'styled-components/native';
import {Apis} from '../services/api';
import {ButtonDefault} from '../components/ButtonDefault';
import {BackGroundComponent} from '../components/BackGroundComponent';
import {ceil} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home: React.FC = ({navigation}) => {
  const [userData, setUserData] = useState({});
  const getItem = async (): Promise<any> => {
    let user = await AsyncStorage.getItem('@user:user').then(json => {
      let res: string = JSON.parse(json);
      return res;
    });
    setUserData(user);
  };

  useEffect(() => {
    getItem();
  }, []);
  const [listOptions] = useState([
    {
      id: 1,
      label: 'Recepção de Notas',
      link: assets.ilustraNotas,
      routerLink: 'ListagemNota',
    },
    {
      id: 2,
      label: 'Ordens de Produção',
      link: assets.ilustraOrdens,
      routerLink: 'ListagemProducao',
    },
    {
      id: 3,
      label: 'Pedidos',
      link: assets.ilustraPedidos,
      routerLink: 'ListagemPedidos',
    },
  ]);
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
      <Container>
        <View
          style={{
            marginTop: 30,
            justifyContent: 'left',
            width: '100%',
            marginLeft: 130,
          }}>
          <Titulo>Olá, {userData?.first_name}</Titulo>
          <BtnConfirm onPress={() => clearStorage()}>
            <BtnConfirmText>Sair</BtnConfirmText>
          </BtnConfirm>
        </View>
        {Dimensions.get('screen').width > 520 ? (
          <FlatList
            horizontal
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            data={listOptions}
            renderItem={({item, index}) => (
              <CardSelectionWithIlustration
                onClick={() => navigation.push(item.routerLink)}
                link={item.link}
                title={item.label}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <View
            style={{
              flex: 1,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FlatList
              contentContainerStyle={{
                marginTop: 40,
              }}
              data={listOptions}
              renderItem={({item, index}) => (
                <CardSelectionWithIlustration
                  onClick={() => navigation.push(item.routerLink)}
                  link={item.link}
                  title={item.label}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </Container>

      {/* <ButtonDefault text="Voltar" onPress={() => {}} /> */}
    </BackGroundComponent>
  );
};

const Container = styled.View`
  flex: 1;
  align-items: center;
`;
const Titulo = styled.Text`
  font-size: 25px;
  color: #3f3f3e;
  font-weight: bold;
`;
const BtnConfirm = styled.TouchableOpacity`
  border-radius: 15px;
  padding: 5px 10px;
  background-color: #c33;
  width: 50px;
`;

const BtnConfirmText = styled.Text`
  color: #fff;
`;
export {Home};
