import React, {useState} from 'react';
import {View, Dimensions, FlatList, ActivityIndicator} from 'react-native';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {ButtonDefault} from './ButtonDefault';
import {ButtonWithBorder} from './ButtonWithBorder';
import assets from '../services/imagesExports';

interface DeviceProps {
  name: string;
  id: string;
}

interface ModalDevicesProps {
  data: Array<DeviceProps>;
  visible: boolean;
  loading: boolean;
  change: (visible?: boolean) => void;
  confirm: (id: string) => void;
}

const ModalDevices: React.FC<ModalDevicesProps> = ({
  data,
  confirm,
  visible,
  loading,
  change,
}) => {
  const [active, setActive] = useState('');
  return (
    <ModalDefault
      visible={visible}
      change={change}
      children={
        <Container>
          <Text>Lista de dispositivos</Text>

          <FlatList
            style={{height: 250}}
            data={data}
            renderItem={({item, index}) => (
              <DescriptionWrapper
                active={item['id'] == active}
                onPress={() => setActive(item['id'])}>
                <Description>{item['name']}</Description>
              </DescriptionWrapper>
            )}
          />

          <RowBtns>
            <BtnWrapper
              style={{
                marginLeft: Dimensions.get('screen').width < 520 ? 5 : 0,
              }}>
              <ButtonWithBorder text="Voltar" onPress={() => change(false)} />
            </BtnWrapper>

            <BtnWrapper>
              {loading ? (
                <Indicator />
              ) : (
                <ButtonDefault
                  text="Conectar"
                  onPress={() => {
                    if (active == '') {
                      alert('Não foi selecionado nenhum dispositivo!');
                    } else {
                      confirm(active);
                    }
                  }}
                />
              )}
            </BtnWrapper>
          </RowBtns>
        </Container>
      }
    />
  );
};

const Container = styled.View`
  ${Dimensions.get('screen').width < 520 && `flex: 1`};
  ${Dimensions.get('screen').width > 520 && `width: 600px`};
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

const Indicator = styled(ActivityIndicator).attrs((props) => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

export {ModalDevices};
