import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {FontsDefault} from '../styles/fonts';

// import { Container } from './styles';
interface ItemListMaterialProps {
  status: string;
  title: string;
  code?: number;
  handleTarugoRePrint: () => void;
  blocked: boolean;
  confirm: () => void;
}

const ItemListMaterial: React.FC<ItemListMaterialProps> = ({
  status,
  title,
  code,
  confirm,
  blocked,
  handleTarugoRePrint,
}) => {
  return (
    <>
      <Container
        disabled={(blocked && status != 'production') || status == 'done'}
        blocked={(blocked && status != 'production') || status == 'done'}
        onPress={confirm}>
        {status == 'production' && (
          <TabStatus option={status}>
            <StatusText>Em uso | ID: {code}</StatusText>
          </TabStatus>
        )}

        {status == 'done' && (
          <TabStatus option={status}>
            <StatusText>Utilizada</StatusText>
          </TabStatus>
        )}

        <Title>
          <>
            {title}
            {status != 'production' && status != 'done' ? (
              <TitleCode> ID: {code}</TitleCode>
            ) : (
              ''
            )}
          </>
        </Title>

        {status == 'production' ||
          (status == 'done' && <CodeText>{code}</CodeText>)}

        {status == 'done' && <IconChecked icon={faCheckCircle} size={30} />}
      </Container>
      {status == 'done' && (
        <TabPressStatus
          style={{width: 100, backgroundColor: '#c33'}}
          onPress={() => handleTarugoRePrint()}>
          <StatusText style={{color: '#fff'}}>Reimpressão</StatusText>
        </TabPressStatus>
      )}
    </>
  );
};

export const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin: 16px 0;
  z-index: 1000;
`;
type StatusOptionsProps = {
  option: string;
};
export const TabPressStatus = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  border-radius: 25px;
  padding: 2px 6px;
`;
export const TabStatus = styled.View<StatusOptionsProps>`
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  border-radius: 25px;
  padding: 2px 6px;
  background-color: ${({theme, option}) =>
    option == 'production' ? theme.lightBlue : theme.lightGreen};
`;

export const StatusText = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.color};
`;
export const TitleCode = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({theme}) => theme.color};
`;

export const Title = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.color};
  width: 60%;
`;

export const CodeText = styled.Text`
  color: ${({theme}) => theme.primary};
  font-size: ${FontsDefault.small};
  margin-left: 16px;
`;

export const IconChecked = styled(FontAwesomeIcon).attrs(props => ({
  color: props.theme.green,
}))`
  margin-left: auto;
`;

export {ItemListMaterial};
