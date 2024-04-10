import React, {useState, useRef} from 'react';
import {
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {ButtonDefault} from './ButtonDefault';
import {ButtonWithBorder} from './ButtonWithBorder';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWeightHanging} from '@fortawesome/free-solid-svg-icons';
import {
  ResponseNoteDetail,
  ObjectNoteProduct,
} from '../models/NoteProductProps';

interface ModalConferenceTabletProps {
  visible: boolean;
  loading: boolean;
  itemToModal: ResponseNoteDetail;
  change: (visible?: boolean) => void;
  confirm: () => void;
  totalItens: number;
  totalMoney: number;
  totalItensAdd: number;
  totalItensWeight: number;
}

const ModalFinish: React.FC<ModalConferenceTabletProps> = ({
  itemToModal,
  visible,
  loading,
  change,
  confirm,
  totalItens,
  totalMoney,
  totalItensAdd,
  totalItensWeight,
}) => {
  const Content = () => (
    <>
      <RowWeight>
        <CardTotal>
          <View>
            <CardTotalText>Peso total da nota</CardTotalText>
            <CardTotalHeight>
              {parseFloat(itemToModal.volume)} kg
            </CardTotalHeight>
          </View>
          <CardTotalIcon icon={faWeightHanging} size={30} />
        </CardTotal>

        <CardTotal>
          <View>
            <CardTotalText>Peso total conferido</CardTotalText>
            <CardTotalHeight>{parseFloat(totalItensWeight)} kg</CardTotalHeight>
          </View>
          <CardTotalIcon icon={faWeightHanging} size={30} />
        </CardTotal>
      </RowWeight>
      <RowWeight>
        <CardTotal>
          <View>
            <CardTotalText>Quantidade de itens</CardTotalText>
            <CardTotalHeight>{totalItens}</CardTotalHeight>
          </View>
          <CardTotalIcon icon={faWeightHanging} size={30} />
        </CardTotal>

        <CardTotal>
          <View>
            <CardTotalText>Quantidade de volumes</CardTotalText>
            <CardTotalHeight>{totalItensAdd}</CardTotalHeight>
          </View>
          <CardTotalIcon icon={faWeightHanging} size={30} />
        </CardTotal>
      </RowWeight>

      <RowBtns>
        <>
          <BtnWrapper
            style={{
              width: Dimensions.get('screen').width < 520 ? '40%' : '30%',
            }}>
            <ButtonWithBorder text="Voltar" onPress={() => change(false)} />
          </BtnWrapper>

          <BtnWrapper
            style={{
              width: Dimensions.get('screen').width < 520 ? '55%' : '30%',
            }}>
            {loading ? (
              <ModalIndicator />
            ) : (
              <ButtonDefault
                text={
                  Dimensions.get('screen').width < 520
                    ? 'Finalizar'
                    : 'Finalizar entrada'
                }
                onPress={() => confirm()}
              />
            )}
          </BtnWrapper>
        </>
      </RowBtns>
    </>
  );
  return (
    <ModalDefault
      visible={visible}
      change={change}
      children={
        <Container>
          {Dimensions.get('screen').width < 520 ? (
            <ScrollView>
              <TouchableOpacity>
                <Content />
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <Content />
          )}
        </Container>
      }
    />
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.background};
  border-radius: 20px;
  padding: ${Dimensions.get('screen').width < 520 ? '16px' : '36px'};
  justify-content: space-between;
`;

const RowWeight = styled.View`
  flex-direction: ${Dimensions.get('screen').width < 520 ? 'column' : 'row'};
  ${Dimensions.get('screen').width > 520 &&
  `
    align-items: center;
  justify-content: space-between;
  `};
`;

const CardTotal = styled.View`
  border-radius: 15px;
  width: ${Dimensions.get('screen').width < 520 ? '100%' : '48%'};
  ${Dimensions.get('screen').width < 520 && 'margin: 16px 0'};
  padding: 16px;
  background-color: ${({theme}) => theme.cardBackGround};
  flex-direction: row;
  align-items: center;
`;

const CardTotalText = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.primary};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const CardTotalHeight = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 32px;
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const CardTotalIcon = styled(FontAwesomeIcon)`
  margin-left: auto;
  color: ${({theme}) => theme.primary};
`;

const RowQtd = styled.View`
  flex-direction: ${Dimensions.get('screen').width < 520 ? 'column' : 'row'};
  ${Dimensions.get('screen').width > 520 &&
  `
    align-items: center;
  justify-content: space-between;
  `};
`;

export const Card = styled.View`
  border-radius: 15px;
  padding: 16px;
  background-color: ${({theme}) => theme.cardBackGround};
  margin: 16px 0;
`;

const Label = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
  margin-bottom: 5px;
`;

const Value = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  margin-bottom: 10px;
`;

const RowBtns = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BtnWrapper = styled.View`
  ${Dimensions.get('screen').width < 520 && 'width: 30%'}
`;

const ModalIndicator = styled(ActivityIndicator).attrs(props => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

export {ModalFinish};
