import React from 'react';
import Modal from 'react-native-modal';
import {Dimensions, View} from 'react-native';
import styled from 'styled-components/native';
import assets from '../services/imagesExports';

interface ModalProps {
  visible: boolean;
  children: React.ReactNode;
  change: () => void;
}

const ModalDefault: React.FC<ModalProps> = ({children, visible, change}) => {
  return (
    <Modal
      style={
        Dimensions.get('screen').width < 520 && {
          position: 'absolute',
          width: 0.9 * Dimensions.get('screen').width,
          height: 0.8 * Dimensions.get('screen').height,
        }
      }
      swipeDirection="down"
      onSwipeComplete={change}
      onModalHide={change}
      isVisible={visible}
      propagateSwipe={true}>
      <Container>
        <TopIlustration resizeMode="contain" source={assets.ilustraTop} />
        <FooterIlustration resizeMode="contain" source={assets.ilustraFooter} />
        {children}
      </Container>
    </Modal>
  );
};

export const Container = styled.View`
  flex: 1;
`;

export const TopIlustration = styled.Image`
  position: absolute;
  top: -40px;
  left: -40px;
  width: 100px;
  height: 100px;
  z-index: 1000;
`;

export const FooterIlustration = styled.Image`
  position: absolute;
  bottom: -60px;
  right: -20px;
  width: 100px;
  height: 100px;
  z-index: 1000;
`;

export {ModalDefault};
