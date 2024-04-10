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

interface CardSelectionOrderProps {
  onClick: () => void;
  status: string;
  number: string;
  date: string;
  total: string;
  volume: string;
  blocked?: boolean;
  maquinaData: object;
}

const CardSelectionOrder: React.FC<CardSelectionOrderProps> = ({
  onClick,
  status,
  number,
  date,
  total,
  volume,
  blocked,
  maquinaData,
}) => {
  const getStatusString = (status: string) => {
    if (status == 'production') {
      return 'produção';
    } else if (status == 'checking') {
      return 'pronto';
    } else if (status == 'preparing') {
      return 'em espera';
    } else if (status == 'waiting') {
      return 'aguardando';
    }
  };
  return (
    <Container
      blocked={blocked && status != 'production'}
      disabled={blocked && status != 'production'}
      onPress={() => onClick()}>
      <ValueNote>N: {number}</ValueNote>
      <Divide />
      <ProductStatusTab status={status}>
        <ProductStatusText style={{fontSize: 15}}>
          {maquinaData.descricao}
        </ProductStatusText>
      </ProductStatusTab>
      <LabelNote>Data</LabelNote>
      <LabelValue>{date.split('-').reverse().join('-')}</LabelValue>

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
};
const Container = styled.TouchableOpacity<ContainerProps>`
  opacity: ${props => (props.blocked ? 0.5 : 1)};
  background-color: ${({theme}) => theme.cardBackGround};
  border-radius: 12px;
  margin: 12px;
  width: ${Dimensions.get('screen').width < 520 ? '93%' : `${wp(100) / 4.5}px`};
  padding: 25px 16px;
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
    status == 'waiting' ? theme.green : theme.lightBlue};
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
export {CardSelectionOrder};
