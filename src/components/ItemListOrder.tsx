import React from 'react';
import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontsDefault} from '../styles/fonts';

// import { Container } from './styles';
interface ItemListOrderProps {
  weight: string;
  title: string;
  onPress: () => void;
}

const ItemListOrder: React.FC<ItemListOrderProps> = ({
  weight,
  title,
  onPress,
}) => {
  return (
    <Container>
      <WeightText>{weight}kg</WeightText>
      <Title>{title}</Title>

      <IconRemoveWrapper onPress={onPress}>
        <IconRemove icon={faTimes} />
      </IconRemoveWrapper>
    </Container>
  );
};

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 10px 0;
`;

export const WeightText = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.color};
  margin-right: 10px;
`;

export const Title = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.color};
`;
export const IconRemoveWrapper = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  margin-left: auto;
  background-color: ${({theme}) => theme.background};
  padding: 5px;
  border-radius: 15px;
`;

export const IconRemove = styled(FontAwesomeIcon).attrs((props) => ({
  color: props.theme.red,
}))``;

export {ItemListOrder};
