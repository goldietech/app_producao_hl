import React from 'react';
import styled from 'styled-components/native';
import {Dimensions, FlatList} from 'react-native';
import {FontsDefault} from '../styles/fonts';
import {RoundedButton} from './RoundedButtom';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTimes, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {
  ResponseNoteDetail,
  ObjectNoteProduct,
  ObjectNoteProductStock,
} from '../models/NoteProductProps';

// import { Container } from './styles';
interface ProductTabletProp {
  itemsData?: Array<any>;
  data: ObjectNoteProduct;
  status: string;
  active: boolean;
  hasHeigh?: boolean;
  onPress: () => void;
  actionEdit: () => void;
  actionDelete: () => void;
  blocked: boolean;
  arrayStock: Array<ObjectNoteProductStock>;
}
const ProductTablet: React.FC<ProductTabletProp> = ({
  itemsData,
  data,
  status,
  active,
  hasHeigh,
  onPress,
  actionEdit,
  actionDelete,
  blocked,
  arrayStock,
}) => {
  const getStatusString = (status: string) => {
    if (status == 'stock_count') {
      return 'em contagem';
    } else if (status == 'conference') {
      return 'conferência';
    } else if (status == 'delivering') {
      return 'em espera';
    } else if (status == 'pre_finish') {
      return 'pronto';
    } else if (status == 'finished') {
      return 'finalizado';
    } else if (status == 'pending') {
      return 'pendente';
    }
  };

  const getVolume = (arrProduct: Array<ObjectNoteProductStock>) => {
    let totalParse = arrProduct.map((product) => {
      if (product != null) {
        return Number(product.total_weight);
      }
    });

    let total = totalParse.reduce((a, b) => Number(a) + Number(b), 0);
    return total;
  };
  return (
    <Container
      disabled={(blocked && status != 'conference') || status == 'finished'}
      blocked={(blocked && status != 'conference') || status == 'finished'}
      status={status}
      onPress={onPress}>
      <ProductArea>
        <ProductTitle>{data.obj_description}</ProductTitle>
        <Row>
          <ProductId>id: {data.id}</ProductId>
          <ProductStatusTab status={status}>
            <ProductStatusText>{getStatusString(status)}</ProductStatusText>
          </ProductStatusTab>
        </Row>

        {arrayStock.length > 0 && (
          <>
            <Divide />
            <ProductId>
              Total conferido: {arrayStock.length}{' '}
              {arrayStock.length > 1 ? 'itens' : 'item'}
            </ProductId>

            <ProductId>Peso total: {getVolume(arrayStock)} kg</ProductId>
          </>
        )}
      </ProductArea>

      <VolumeArea>
        <VolumeTag type="pct">
          <VolumeTagText>kg</VolumeTagText>
        </VolumeTag>
        <VolumeQtd>{data.total}</VolumeQtd>
      </VolumeArea>
      <PriceArea>
        {hasHeigh ? (
          <PriceUnit>150kg/800kg</PriceUnit>
        ) : (
          <>
            <PriceTotal>R$ {data.price}</PriceTotal>
          </>
        )}
      </PriceArea>

      {status == 'finished' ? (
        <IconChecked icon={faCheckCircle} size={45} />
      ) : (
        <ActionsArea>
          <NotChecked />
        </ActionsArea>
      )}

      {/* {status == 'sent' && !conferenceMode && (
        <ActionsArea>
          <ActionBtn>
            <RoundedButton colorString="yellow" icon="edit" />
          </ActionBtn>

          <ActionBtn>
            <RoundedButton colorString="red" icon="remove" />
          </ActionBtn>
        </ActionsArea>
      )} */}
    </Container>
  );
};

type ContainerProp = {
  blocked: boolean;
  status: string;
};
type TypeHeightProps = {
  type: 'frd' | 'pct';
};
const Container = styled.TouchableOpacity<ContainerProp>`
  box-shadow: 2px 2px 2px #dedede;
  background-color: ${({theme}) => theme.cardBackGround};
  margin: 16px;
  border-radius: 15px;
  padding: 16px;
  flex-direction: row;
  justify-content: space-around;
  border: 3px solid
    ${({theme, status}) =>
      status == 'finished' || status == 'conference'
        ? theme.green
        : theme.cardBackGround};
`;

const ProductArea = styled.View`
  width: 40%;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ProductTitle = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
`;

const ProductId = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: 14px;
  font-family: ${({theme}) => theme.fontSecondary};
`;

const ProductStatusTab = styled.View<{status: string}>`
  background-color: ${({theme, status}) =>
    status == 'finished' ? theme.green : theme.lightBlue};
  justify-content: center;
  align-items: center;
  width: 100px;
  border-radius: 15px;
  padding: 5px;
  margin: 16px 0;
  margin-left: 16px;
`;

const ProductStatusText = styled.Text`
  color: ${({theme}) => theme.background};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const VolumeArea = styled.View`
  width: 12.5%;
  padding: 10px 0;
`;

const VolumeTag = styled.View<TypeHeightProps>`
  background-color: ${(props) =>
    props.type == 'pct' ? props.theme.darkBlue : props.theme.blue};
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  padding: 5px;
  margin-bottom: 10px;
`;

const VolumeTagText = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.background};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const VolumeQtd = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const PriceArea = styled.View`
  width: 12.5%;
  padding: 10px 0;
`;

const PriceUnit = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: ${FontsDefault.small};
  font-family: ${({theme}) => theme.fontSecondary};
  padding: 5px;
  margin-bottom: 10px;
`;

const PriceTotal = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: ${FontsDefault.medium};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const ActionsArea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 15%;
`;

const ActionBtn = styled.TouchableOpacity`
  margin: 0 8px;
`;

const NotChecked = styled.View`
  height: 45px;
  width: 45px;
  border-radius: 25px;
  border: 1px solid #525354;
`;

export const IconChecked = styled(FontAwesomeIcon).attrs((props) => ({
  color: props.theme.green,
}))`
  align-self: center;
`;

const Divide = styled.View`
  height: 1px;
  background-color: ${({theme}) => theme.gray};
  width: 100%;
  margin-bottom: 10px;
  opacity: 0.8;
`;

export {ProductTablet};
