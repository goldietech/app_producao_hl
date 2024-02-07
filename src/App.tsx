// In App.js in a new project
import 'react-native-gesture-handler';
import codePush from 'react-native-code-push';
import * as React from 'react';
import {ThemeProvider} from 'styled-components';
import {Routes} from './routes';
import {useColorScheme, Dimensions} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import themes from './themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Indicator} from './components/Indicator';
import {OrderContextComponent} from './context/OrderContext';
function App() {
  React.useEffect(() => {
    if (Dimensions.get('screen').width > 520) {
      Orientation.lockToLandscape();
    }
    const getTheme = async () => {
      let themeSaved = JSON.parse(await AsyncStorage.getItem('@theme:theme'));

      if (themeSaved == 'light') {
        setMytheme('light');
      } else if (themeSaved == 'dark') {
        setMytheme('dark');
      } else if (themeSaved == 'orange') {
        setMytheme('orange');
      } else if (themeSaved == 'darkOrange') {
        setMytheme('darkOrange');
      } else {
        setMytheme('light');
      }
    };
    getTheme();
  }, []);
  const [myTheme, setMytheme] = React.useState('');
  let deviceTheme = useColorScheme();
  const theme = themes[myTheme] || themes[deviceTheme] || themes.light;
  return (
    <ThemeProvider theme={theme}>
      {!myTheme ? (
        <Indicator />
      ) : (
        <OrderContextComponent>
          <Routes theme={theme} />
        </OrderContextComponent>
      )}
    </ThemeProvider>
  );
}

export default codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
  installMode: codePush.InstallMode.IMMEDIATE,
  updateDialog: true,
})(App);
