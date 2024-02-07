import React, {useEffect, useState, useContext} from 'react';
import {FlatList, Dimensions, RefreshControl} from 'react-native';
import styled from 'styled-components/native';
import {BackGroundComponent} from '../components/BackGroundComponent';
import {CardSelectionOrder} from '../components/CardSelectionOrder';
import {Apis} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ObjectProduct, ResponseOrder} from '../models/OrderProps';
import {Indicator} from '../components/Indicator';
import {OrderContext} from '../context/OrderContext';
import {FontsDefault} from '../styles/fonts';

// import { Container } from './styles';
const {width} = Dimensions.get('screen');

const ListagemProducao: React.FC = ({navigation}) => {
  const context = useContext(OrderContext);
  const [turnOffOptions, setTurnOffOptions] = useState([]);

  useEffect(() => {
    getListOrders();
  }, []);

  const getListOrders = async () => {
    setLoading(true);
    let asyncToken: Promise<string | null> = await AsyncStorage.getItem(
      '@user:token',
    );
    let token = JSON.parse(asyncToken);
    try {
      const resOrders = await Apis.api.get(
        `${token}/production_orders/ProductionOrderApi/read?requiredFields=*&requiredFieldsObject=*&objectRequiredFields=*&ordersObject=true&turnOffOptions=true&status=waiting,production
        `,
      );

      setData(resOrders.data.objData);
      setTurnOffOptions(resOrders.data.turnOffOptions);
      context.populateOrders(resOrders.data.objData);
      // console.log(resOrders);
      setLoading(false);
      // navigation.push('Home');
    } catch (error) {
      console.log(error);

      setData([]);
      context.populateOrders([]);
      setLoading(false);
      console.log('opss');
    }
  };

  const getVolume = (arrProduct: Array<ObjectProduct>) => {
    let totalParse = arrProduct.map(product => {
      if (product != null) {
        return Number(product.obj_quantity);
      }
    });

    let total = totalParse.reduce((a, b) => Number(a) + Number(b), 0);
    return total;
  };

  const [data, setData] = useState<ResponseOrder[] | undefined>(undefined);

  const [loading, setLoading] = useState(false);

  const getAllStatus = () => {
    console.log({mmdmdmdm: context.getOrders()});
    let total = context
      .getOrders()
      .filter((obj: ResponseOrder) => obj.status == 'production');
    if (total.length > 0) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <BackGroundComponent>
      {!data ? (
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
              <CardSelectionOrder
                onClick={() =>
                  navigation.push('DetalhesOrdem', {
                    data: item,
                    turnOffOptions: turnOffOptions,
                  })
                }
                number={item.code}
                date={item.start_date}
                volume={`${getVolume(item.OrdersObject).toString()} kg`}
                total={item.OrdersObject.length.toString()}
                blocked={!getAllStatus()}
                status={item.status}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => getListOrders()}
              />
            }
            ListEmptyComponent={() => (
              <EmptyTextContainer>
                <EmptyText>Não existe ordens para conferência</EmptyText>
              </EmptyTextContainer>
            )}
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

export {ListagemProducao};
