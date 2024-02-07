import React, {useEffect, useState} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import assets from '../services/imagesExports';
import {CardSelectionWithIlustration} from '../components/CardSelectionWithIlustration';
import styled from 'styled-components/native';
import {ButtonDefault} from '../components/ButtonDefault';
import {BackGroundComponent} from '../components/BackGroundComponent';
import {ceil} from 'react-native-reanimated';

const Home: React.FC = ({navigation}) => {
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

  return (
    <BackGroundComponent>
      <Container>
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

export {Home};
