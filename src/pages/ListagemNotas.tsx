import React, {useEffect, useState, useContext} from 'react';
import {FlatList, Dimensions, RefreshControl} from 'react-native';
import styled from 'styled-components/native';
import {CardSelectionNote} from '../components/CardSelectionNote';
import {BackGroundComponent} from '../components/BackGroundComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Apis} from '../services/api';
import {Indicator} from '../components/Indicator';
import {ResponseNote} from '../models/NoteProps';
import {FontsDefault} from '../styles/fonts';
import {OrderContext} from '../context/OrderContext';

// import { Container } from './styles';
const {width} = Dimensions.get('screen');
const ListagemNotas: React.FC = ({navigation}) => {
  const context = useContext(OrderContext);
  useEffect(() => {
    getListNotes();
  }, []);

  const getListNotes = async () => {
    setLoading(true);
    let asyncToken: Promise<string | null> = await AsyncStorage.getItem(
      '@user:token',
    );
    let token = JSON.parse(asyncToken);
    try {
      const resNotes = await Apis.apiPlugin.get(
        `${token}/purchase/PurchaseDelivery/PurchaseDeliveries/read?status=stock_count,conference&prepareData=true`,
      );

      setData(resNotes.data.deliveriesData);
      context.populateNotes(resNotes.data.deliveriesData);
      setLoading(false);
    } catch (error) {
      setData([]);
      setLoading(false);
      console.log('opss');
    }
  };

  const [data, setData] = useState<ResponseNote[] | undefined>([]);
  const [loading, setLoading] = useState(false);

  const getAllStatus = () => {
    let total = context
      .getNotes()
      .filter((obj: ResponseNote) => obj.status == 'conference');
    if (total.length > 0) {
      return false;
    } else {
      return true;
    }
  };
  return (
    <BackGroundComponent>
      {loading ? (
        <Indicator />
      ) : (
        <Container>
          <FlatList
            contentContainerStyle={{
              alignItems: width > 520 ? 'center' : 'stretch',
            }}
            numColumns={width > 520 ? 4 : 1}
            data={data}
            renderItem={({item, index}) => (
              <CardSelectionNote
                onClick={() => navigation.push('DetalhesNotas', {data: item})}
                value={item.reference_number}
                number={item.total}
                provider={item.purchaseData.supplier_name}
                total={item.itens}
                volume={item.volume}
                status={item.status}
                blocked={!getAllStatus()}
              />
            )}
            ListEmptyComponent={() => (
              <EmptyTextContainer>
                <EmptyText>Não existe notas para recepção</EmptyText>
              </EmptyTextContainer>
            )}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => getListNotes()}
              />
            }
            keyExtractor={(item, index) => index.toString()}
          />
        </Container>
      )}
    </BackGroundComponent>
  );
};

const Container = styled.View`
  flex: 1;
`;

const EmptyTextContainer = styled.View`
  height: 200px;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: ${({theme}) => FontsDefault.large};
`;

export {ListagemNotas};
