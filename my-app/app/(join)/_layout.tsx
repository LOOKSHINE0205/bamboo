import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "회원 가입",
          headerShown: true,
        }}
      />

       <Stack.Screen
              name="login"
              options={{
                title: "로그인",
                headerShown: true,
              }}
            />
       <Stack.Screen
             name="index2"
             options={{
               title: "회원 가입",
               headerShown: true,
             }}
           />
       <Stack.Screen
             name="sendUserInfo"
             options={{
               title: "회원 가입",
               headerShown: true,
             }}
           />
       <Stack.Screen
             name="index3"
             options={{
               title: "사용 설명서",
               headerShown: true,
             }}
           />
    </Stack>
  );
}