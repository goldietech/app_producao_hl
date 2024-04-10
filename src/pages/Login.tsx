import React, {useState, useRef} from 'react';
import {Dimensions, ScrollView, ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';
import {BackGroundComponent} from '../components/BackGroundComponent';
import assets from '../services/imagesExports';
import {FontsDefault} from '../styles/fonts';
import {ButtonDefault} from '../components/ButtonDefault';
import {StackScreenProps} from '@react-navigation/stack';
import {Apis} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
};

type Props = StackScreenProps<RootStackParamList>;
// import { Container } from './styles';
const {width} = Dimensions.get('screen');
const Login: React.FC<Props> = ({navigation}) => {
  const [user, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const resLogin = await Apis.api.post('/login', {
        user: user,
        password: password,
        company: 'hlplast',
        address: true,
      });

      await AsyncStorage.setItem(
        '@user:token',
        JSON.stringify(resLogin.data.token),
      );
      await AsyncStorage.setItem(
        '@user:user',
        JSON.stringify(resLogin.data.userData),
      );
      setLoading(false);
      setUser('');
      setPassword('');
      navigation.push('Home');
    } catch (error) {
      setLoading(false);
      alert('opss');
    }
  };

  return (
    <BackGroundComponent>
      <Container>
        <ScrollView ref={scrollRef}>
          <FormCard>
            <IlustraImage source={assets.ilustraOrdens} />
            <LoginText>Login</LoginText>

            <LoginInput
              onFocus={() => scrollRef.current.scrollTo({y: 20})}
              value={user}
              onChangeText={user => setUser(user)}
              placeholder="digite seu usuário"
              autoCapitalize="none"
            />

            <LoginInput
              value={password}
              secureTextEntry
              onChangeText={password => setPassword(password)}
              placeholder="digite sua senha"
            />

            <ForgotBtn>
              <ForgotText>Esqueceu a senha?</ForgotText>
            </ForgotBtn>
            <SubmitWrapper>
              {loading ? (
                <Indicator />
              ) : (
                <ButtonDefault text="Logar" onPress={() => handleLogin()} />
              )}
            </SubmitWrapper>
          </FormCard>
        </ScrollView>
      </Container>
    </BackGroundComponent>
  );
};

const Container = styled.View`
  flex: 1;
`;

const FormCard = styled.KeyboardAvoidingView`
  margin: ${width < 520 ? '16px' : '40px 100px'};
  background-color: ${({theme}) => theme.cardBackGround};
  border-radius: 15px;
`;
const IlustraImage = styled.Image`
  align-self: center;
  margin-top: ${width < 520 ? '0px' : '-30px'};
`;

const LoginText = styled.Text`
  font-size: ${width < 520 ? FontsDefault.large : '32px'};
  font-weight: bold;
  font-family: ${({theme}) => theme.fontPrimary};
  color: ${({theme}) => theme.color};
  text-align: center;
  margin: 16px 0;
`;

const LoginInput = styled.TextInput.attrs(props => ({
  placeholderTextColor: props.theme.gray,
}))`
  width: ${width < 520 ? '90%' : '60%'};
  padding: 20px 16px;
  background-color: ${({theme}) => theme.background};
  margin: 16px 20px;
  border-radius: 15px;
  align-self: center;
  color: ${({theme}) => theme.color};
`;

const ForgotBtn = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  margin: 16px 0;
  align-self: center;
`;

const ForgotText = styled.Text`
  font-size: ${FontsDefault.medium};
  font-family: ${({theme}) => theme.fontSecondary};
  color: ${({theme}) => theme.color};
`;

const SubmitWrapper = styled.View`
  align-self: center;
  width: 60%;
  padding: 20px 16px;
  margin: 16px 20px;
`;

const Indicator = styled(ActivityIndicator).attrs(props => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

export {Login};
