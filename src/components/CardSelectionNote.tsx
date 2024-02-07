import React from 'react';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Dimensions} from 'react-native';
import {Dots} from './DotsFooter';
import {RoundedButton} from './RoundedButtom';

interface CardSelectionProps {
  onClick: () => void;
  value: string;
  number: string;
  provider: string;
  total: string;
  volume: string;
  active?: boolean;
  status: string;
  blocked: boolean;
}

const CardSelectionNote: React.FC<CardSelectionProps> = ({
  onClick,
  value,
  number,
  provider,
  total,
  volume,
  active,
  status,
  blocked,
}) => {
  const getStatusString = (status: string) => {
    if (status == 'stock_count') {
      return 'pendente';
    } else if (status == 'conference') {
      return 'conferência';
    } else if (status == 'delivering') {
      return 'em espera';
    } else if (status == 'pre_finish') {
      return 'pronto';
    } else if (status == 'finished') {
      return 'finalizado';
    }
  };
  return (
    <Container
      blocked={blocked && status != 'conference'}
      disabled={blocked && status != 'conference'}
      active={status == 'conference'}
      onPress={() => onClick()}>
      <NumberNote>N: {value}</NumberNote>
      {/* <ValueNote>R$ {number}</ValueNote> */}
      <Divide />
      <LabelNote>Fornecedor</LabelNote>
      <LabelValue>{provider}</LabelValue>
      <LabelNote>Total de itens</LabelNote>
      <LabelValue>{total}</LabelValue>
      <LabelNote>Peso</LabelNote>
      <LabelValue>{volume} kg</LabelValue>
      {Dimensions.get('screen').width < 520 ? (
        <DotsLine style={{marginLeft: 5}}>
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
        </DotsLine>
      ) : (
        <DotsLine>
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
          <Dots />
        </DotsLine>
      )}
      <BtnFloat>
        <ProductStatusTab status={status}>
          <ProductStatusText>{getStatusString(status)}</ProductStatusText>
        </ProductStatusTab>
      </BtnFloat>
    </Container>
  );
};

type ContainerProps = {
  blocked: boolean;
  active: boolean;
};
const Container = styled.TouchableOpacity<ContainerProps>`
  opacity: ${(props) => (props.blocked ? 0.5 : 1)};
  background-color: ${({theme}) => theme.cardBackGround};
  border-radius: 12px;
  margin: 12px;
  width: ${Dimensions.get('screen').width < 520 ? '93%' : `${wp(100) / 4.5}px`};
  padding: 25px 16px;
  border: 3px solid
    ${({theme, active}) => (active ? theme.green : theme.cardBackGround)};
`;

const NumberNote = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.primary};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const ValueNote = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  text-transform: uppercase;
  font-weight: bold;
  font-family: ${({theme}) => theme.fontPrimary};
`;

const Divide = styled.View`
  height: 1px;
  background-color: ${({theme}) => theme.gray};
  width: 100%;
  margin: 20px 0;
  opacity: 0.8;
`;

const LabelNote = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
  margin-top: 10px;
`;

const LabelValue = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  margin-bottom: 10px;
`;

const BtnFloat = styled.View`
  position: absolute;
  right: 26px;
  top: 25px;
`;

const DotsLine = styled.View`
  flex-direction: row;
  align-items: center;
  position: absolute;
  bottom: -10px;
`;

const ProductStatusTab = styled.View<{status: string}>`
  background-color: ${({theme, status}) =>
    status == 'done' ? theme.green : theme.lightBlue};
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  padding: 5px;
  margin: 8px 0;
`;

const ProductStatusText = styled.Text`
  color: ${({theme}) => theme.dark};
  font-family: ${({theme}) => theme.fontSecondary};
  font-size: 10px;
`;

export {CardSelectionNote};
