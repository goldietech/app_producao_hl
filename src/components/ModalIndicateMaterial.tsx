import React, {useState} from 'react';
import {View, Dimensions, ActivityIndicator} from 'react-native';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import {ButtonDefault} from './ButtonDefault';
import {ButtonWithBorder} from './ButtonWithBorder';

interface ModalIndicateMaterialProps {
  visible: boolean;
  change: (visible?: boolean) => void;
  confirm: (code: number) => void;
  loading: boolean;
}

const ModalIndicateMaterial: React.FC<ModalIndicateMaterialProps> = ({
  confirm,
  visible,
  change,
  loading,
}) => {
  const [code, setCode] = useState('');
  return (
    <ModalDefault
      visible={visible}
      change={change}
      children={
        <Container>
          <Text>Matéria Prima</Text>
          <InputArea>
            <InputLabel>Código</InputLabel>
            <InputText
              keyboardType="phone-pad"
              value={code}
              onChangeText={(code) => setCode(code)}
              placeholder="Digite aqui.."
            />
          </InputArea>
          <RowBtns>
            <BtnWrapper
              style={{
                marginLeft: Dimensions.get('screen').width < 520 ? 5 : 0,
              }}>
              <ButtonWithBorder text="Voltar" onPress={() => change(false)} />
            </BtnWrapper>

            <BtnWrapper>
              {loading ? (
                <ModalIndicator />
              ) : (
                <ButtonDefault
                  text="Adicionar"
                  onPress={() => {
                    if (code == '') {
                      alert('campo vazio');
                    } else {
                      confirm(Number(code));
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

const InputArea = styled.View`
  margin: 36px 0;
`;

const InputLabel = styled.Text`
  margin-bottom: 10px;
  color: ${({theme}) => theme.color};
`;
type InputTextProps = {
  myTheme?: string;
};
const InputText = styled.TextInput.attrs<InputTextProps>((props) => ({
  placeholderTextColor: props.theme.gray,
}))<InputTextProps>`
  background-color: ${({theme, myTheme}) =>
    myTheme == 'dark' ? theme.cardBackGround : theme.background};
  border-radius: 30px;
  padding: 10px;
  width: 100%;
  color: ${({theme}) => theme.color};
  text-align: center;
`;

const RowBtns = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
`;

const BtnWrapper = styled.View`
  width: ${Dimensions.get('screen').width < 520 ? '42%' : '40%'};
  margin: ${Dimensions.get('screen').width < 520 ? '0 18px' : '0 16px'};
`;

const ModalIndicator = styled(ActivityIndicator).attrs((props) => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

export {ModalIndicateMaterial};
