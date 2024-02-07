import React, { useEffect, useState, useReducer } from 'react';
import { Dimensions, View } from 'react-native';
import assets from '../services/imagesExports';
import { FontsDefault } from '../styles/fonts';
import styled from 'styled-components/native';
import { ModalDefault } from './ModalDefault';
import Axios from 'axios';

// import { Container } from './styles';

const SendPrint: React.FC<{
  print: boolean;
  printList: Array<string>;
  printLink: string;
  setPrintData: (data:any) => void;
}> = ({ print, printList, printLink, setPrintData }) => {
  const [visibleModal, setVisibleModal] = useState(false);
  useEffect(() => {
    if (print) {
      const controller = new AbortController();
      printList.map((zpl) => {
        fetchTimeout(`${printLink}`, zpl, 5000, { signal: controller.signal })
          .then((response) => response.json())
          .then(console.log)
          .catch((error) => {
            if (error.name === 'AbortError') {
              // fetch aborted either due to timeout or due to user clicking the cancel button
            } else {
              // network error or json parsing error
            }
          });

        // fetchData(`${printLink}`, fetchParams);
      });
  
    }
     
  }, []);

  const fetchTimeout = (url, zpl, ms, { signal, ...options } = {}) => {
    const controller = new AbortController();
    const promise = fetch(url, {
      signal: controller.signal,
      method: 'post',
      headers: { 'Content-Type': 'text/plain' },
      body: zpl,
    });
    if (signal) signal.addEventListener('abort', () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
  };

  return (
    <>
      <ModalDefault
        visible={visibleModal}
        change={() => setVisibleModal(false)}
        children={
          <Container>
            <Ilustration
              resizeMode={
                Dimensions.get('screen').width < 520 ? 'contain' : 'center'
              }
              source={assets.boxAnimationEmpty}
            />
            <Content>
              <Text>Ops erro ao enviar para impressora</Text>
              <TextPrint>IP: {printLink}</TextPrint>
            </Content>
          </Container>
        }
      />
    </>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.cardBackGround};
  border-radius: 20px;
  align-items: center;
  padding: 26px;

  ${Dimensions.get('screen').width > 520 &&
  `
 margin: 50px 180px;
    padding: 46px;
  `};
`;

const Content = styled.View`
  align-items: center;
`;

const Ilustration = styled.Image`
  position: absolute;
  top: ${Dimensions.get('screen').width < 520 ? '70px' : '-45px'};
  ${Dimensions.get('screen').width < 520 &&
  `
    width: 300px;
  height: 300px;
  `}
`;

const Text = styled.Text`
  font-size: ${Dimensions.get('screen').width < 520
    ? FontsDefault.large
    : '32px'};
  font-weight: bold;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color};
  font-family: ${({ theme }) => theme.fontPrimary};
  margin: 10px 0;
  text-align: center;
`;

const TextPrint = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: green;
  font-family: ${({ theme }) => theme.fontPrimary};
  margin: 2px 0;
  text-align: center;
`;

export { SendPrint };
