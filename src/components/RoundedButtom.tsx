import React from 'react';
import styled from 'styled-components/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTrash, faEdit} from '@fortawesome/free-solid-svg-icons';
interface RoundedButtonProps {
  colorString: 'yellow' | 'red';
  icon: 'edit' | 'remove';
}

const RoundedButton: React.FC<RoundedButtonProps> = ({colorString, icon}) => {
  return (
    <Container color={colorString}>
      <Icon size={18} icon={icon == 'edit' ? faEdit : faTrash} />
    </Container>
  );
};

type colorStringProp = {
  color: string;
};

export const Container = styled.View<colorStringProp>`
  height: 45px;
  width: 45px;
  border-radius: 40px;
  background-color: ${(props) =>
    props.color == 'yellow' ? props.theme.yellow : props.theme.red};
  justify-content: center;
  align-items: center;
`;

export const Icon = styled(FontAwesomeIcon)`
  color: ${({theme}) => theme.background};
`;

export {RoundedButton};
