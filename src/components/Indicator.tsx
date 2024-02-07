import React from 'react';
import {ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';

const Indicator: React.FC = () => {
  return (
    <Container>
      <Activity />
    </Container>
  );
};

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const Activity = styled(ActivityIndicator).attrs((props) => ({
  color: '#000',
  size: 40,
}))``;

export {Indicator};
