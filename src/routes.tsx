import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {LoadingScreen} from './pages/LoadingScreen';
import {Home} from './pages/home';
import {ListagemNotas} from './pages/ListagemNotas';
import {ListagemProducao} from './pages/ListagemProducao';
import {DetalhesNotas} from './pages/DetalhesNotas';
import {DetalhesOrdem} from './pages/DetalhesOrdem';
import {Producao} from './pages/Producao';
import {Configuration} from './pages/Configuration';
import {Login} from './pages/Login';
import {Connection} from './pages/Connection';
import {ConferenciaNota} from './pages/ConferenciaNotaTablet';
import {ListagemPedidos} from './pages/ListagemPedidos';
import {DetalhesPedido} from './pages/DetalhesPedido';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function Main({route}) {
  const {myTheme} = route.params;

  return (
    <Stack.Navigator
      initialRouteName="LoadingScreen"
      screenOptions={({route, navigation}) => ({
        headerTintColor: myTheme.color,
        headerStyle: {
          backgroundColor: myTheme.background,
        },
      })}>
      <Stack.Screen
        name="LoadingScreen"
        component={LoadingScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ListagemNota"
        component={ListagemNotas}
        options={{title: 'Listagem de Notas'}}
      />
      <Stack.Screen
        name="ConferenciaNota"
        component={ConferenciaNota}
        options={{title: 'Conferência de produto'}}
      />

      <Stack.Screen name="DetalhesNotas" component={DetalhesNotas} />
      <Stack.Screen
        name="ListagemProducao"
        component={ListagemProducao}
        options={{title: 'Listagem de Produção'}}
      />
      <Stack.Screen name="DetalhesPedido" component={DetalhesPedido} />
      <Stack.Screen
        name="ListagemPedidos"
        component={ListagemPedidos}
        options={{title: 'Listagem de Pedidos'}}
      />
      <Stack.Screen name="DetalhesOrdem" component={DetalhesOrdem} />
      <Stack.Screen name="Producao" component={Producao} />
    </Stack.Navigator>
  );
}

function ConfigurationStack() {
  return (
    <Stack.Navigator initialRouteName="Configuration">
      <Stack.Screen
        name="Configuration"
        component={Configuration}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

function ConnectionStack() {
  return (
    <Stack.Navigator initialRouteName="Connections">
      <Stack.Screen
        name="Connections"
        component={Connection}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

function Routes({theme}) {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerStyle={{
          backgroundColor: theme.background,
        }}
        drawerContentOptions={{
          labelStyle: theme.color,
          activeTintColor: theme.primary,
          inactiveTintColor: theme.color,
        }}>
        <Drawer.Screen
          name="Home"
          initialParams={{myTheme: theme}}
          options={{headerShown: false}}
          component={Main}
        />
        <Drawer.Screen name="Configuration" component={ConfigurationStack} />
        <Drawer.Screen name="Connection" component={ConnectionStack} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export {Routes};
