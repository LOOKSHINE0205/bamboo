import { View, Text } from 'react-native';

const MonthView = ({ route }) => {
  // route.params에서 전달된 파라미터를 추출
  const { year, date } = route.params;

  return (
    <View>
      <Text>Year: {year}</Text>
      <Text>Date: {date}</Text>
    </View>
  );
};

export default MonthView;