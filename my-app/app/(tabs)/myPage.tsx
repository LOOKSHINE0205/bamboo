import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, ImageBackground, Image, ScrollView, useWindowDimensions, Animated, Easing } from 'react-native';
import { getUserInfo } from '../../storage/storageHelper';
import { useFocusEffect } from '@react-navigation/native';

const backgroundImage = require('../../assets/images/긴배경2.png');
const pandaImage = require('../../assets/images/판다.png');
const bambooBody = require('../../assets/images/bamboo_body.png');
const bambooHead = require('../../assets/images/bamboo_head.png');
const cloud1 = require('../../assets/images/구름들.png');
const cloud2 = require('../../assets/images/구름들2.png');
const bamboo = require('../../assets/images/bamboo.png');

export default function MyPage() {
    const { width, height } = useWindowDimensions();
    const scrollViewRef = useRef(null);
    const [chatbotLevel, setChatbotLevel] = useState(null);
    const [chatbotName, setChatbotName] = useState('');
    const [textColor, setTextColor] = useState('#333');
    const [cloud1Top, setCloud1Top] = useState(`${45 + Math.random() * 8}%`);
    const [cloud2Top, setCloud2Top] = useState(`${45 + Math.random() * 8}%`);
    const gapBetweenBodies = -7;
    const scrollThreshold = 600;

    const cloud1Animation = useRef(new Animated.Value(-width * 0.25)).current;
    const cloud2Animation = useRef(new Animated.Value(-width * 0.25)).current;

    const createStarAnimations = () => {
        return Array.from({ length: 20 }, () => ({
            opacity: new Animated.Value(0),
            scale: new Animated.Value(1),
            top: `${1 + Math.random() * 15}%`,
            left: `${Math.random() * 100}%`,
        }));
    };

    const [starAnimations] = useState(createStarAnimations());

    const animateStars = () => {
        starAnimations.forEach((star) => {
            const animateStar = () => {
                const delay = Math.random() * 2000;
                const loop = () => {
                    star.opacity.setValue(0);
                    star.scale.setValue(1);
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.parallel([
                            Animated.timing(star.opacity, {
                                toValue: 1,
                                duration: 1000,
                                easing: Easing.linear,
                                useNativeDriver: true,
                            }),
                            Animated.timing(star.scale, {
                                toValue: 1.5,
                                duration: 1000,
                                easing: Easing.linear,
                                useNativeDriver: true,
                            }),
                        ]),
                        Animated.parallel([
                            Animated.timing(star.opacity, {
                                toValue: 0,
                                duration: 1000,
                                easing: Easing.linear,
                                useNativeDriver: true,
                            }),
                            Animated.timing(star.scale, {
                                toValue: 1,
                                duration: 1000,
                                easing: Easing.linear,
                                useNativeDriver: true,
                            }),
                        ]),
                    ]).start(() => {
                        star.top = `${1 + Math.random() * 15}%`;
                        star.left = `${Math.random() * 100}%`;
                        requestAnimationFrame(loop);
                    });
                };
                requestAnimationFrame(loop);
            };
            animateStar();
        });
    };

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const userInfo = await getUserInfo();
                if (userInfo) {
                    setChatbotName(userInfo.chatbotName);
                    setChatbotLevel(userInfo.chatbotLevel);
                } else {
                    Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                Alert.alert("오류", "사용자 정보를 불러오는 중 문제가 발생했습니다.");
            }
        };
        loadUserInfo();
        animateStars();

        const animateCloud1 = () => {
            Animated.sequence([
                Animated.timing(cloud1Animation, {
                    toValue: width,
                    duration: 12000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(cloud1Animation, {
                    toValue: -width * 0.25,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setCloud1Top(`${47 + Math.random() * 8}%`);
                animateCloud1();
            });
        };

        const animateCloud2 = () => {
            Animated.sequence([
                Animated.timing(cloud2Animation, {
                    toValue: width,
                    duration: 8000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(cloud2Animation, {
                    toValue: -width * 0.25,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setCloud2Top(`${47 + Math.random() * 8}%`);
                animateCloud2();
            });
        };

        animateCloud1();
        animateCloud2();
    }, [width, height]);

    useFocusEffect(
        React.useCallback(() => {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, [])
    );

    const bambooLevel = chatbotLevel !== null ? Math.floor(chatbotLevel / 30) : 1;
    const displayLevel = chatbotLevel !== null ? (chatbotLevel - 1) % 30 + 1 : 1;
    const treeLevel = `Lv ${displayLevel}`;

    const renderBambooStack = useMemo<JSX.Element[]>(() => {
        const bambooElements = [];
        const bambooBodyWidth = width * 0.5;
        const bambooBodyHeight = height * 0.07;

        bambooElements.push(
            <Image
                key="bamboo-head"
                source={bambooHead}
                style={[
                    styles.bambooHead,
                    { width: bambooBodyWidth, height: bambooBodyHeight * 1.25, zIndex: displayLevel + 1, marginBottom: -7 },
                ]}
                resizeMode="contain"
            />
        );

        for (let i = 0; i < displayLevel; i++) {
            bambooElements.push(
                <Image
                    key={`bamboo-body-${i}`}
                    source={bambooBody}
                    style={[
                        styles.bambooBody,
                        {
                            width: bambooBodyWidth,
                            height: bambooBodyHeight,
                            marginBottom: gapBetweenBodies,
                            zIndex: displayLevel - i,
                        },
                    ]}
                    resizeMode="contain"
                />
            );
        }

        return bambooElements;
    }, [displayLevel, width, height]);

    const getBambooStyle = (level) => {
        switch (level) {
            case 1:
                return { width: width * 0.1, height: height * 0.1, bottom: '11%', left: '52%' };
            case 2:
                return { width: width * 0.2, height: height * 0.13, bottom: '10%', left: '8%' };
            case 3:
                return { width: width * 0.3, height: height * 0.18, bottom: '9%', left: '75%' };
            case 4:
                return { width: width * 0.4, height: height * 0.25, bottom: '7.5%', left: '55%' };
            case 5:
                return { width: width * 0.5, height: height * 0.31, bottom: '1%', left: -60 };
            default:
                return { width: width * 0.5, height: height * 0.1, bottom: '10%' };
        }
    };

    const renderBambooImages = useMemo<JSX.Element[]>(() => {
        const bambooElements = [];
        for (let i = 0; i < bambooLevel; i++) {
            bambooElements.push(
                <Image
                    key={`bamboo-${i}`}
                    source={bamboo}
                    style={[
                        styles.bamboo,
                        getBambooStyle(i + 1),
                    ]}
                    resizeMode="contain"
                />
            );
        }
        return bambooElements;
    }, [bambooLevel, width, height]);

    return (
        <View style={styles.backgroundContainer}>
            <View style={styles.fixedInfoContainer}>
                <Text style={[styles.levelText, { color: textColor }]}>{treeLevel}</Text>
                <Text style={[styles.treeNameText, { color: textColor }]}>{chatbotName}</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContent]}
                showsVerticalScrollIndicator={false}
                onScroll={(event) => {
                    const scrollY = event.nativeEvent.contentOffset.y;
                    setTextColor(scrollY > scrollThreshold ? '#000000' : '#FFFFFF');
                }}
                scrollEventThrottle={32}
            >
                <ImageBackground source={backgroundImage} style={[styles.background, { height: height * 2.1 }]} resizeMode="cover">
                    <Animated.Image source={cloud1} style={[styles.cloud, { top: cloud1Top, transform: [{ translateX: cloud1Animation }] }]} resizeMode="contain" />
                    <Animated.Image source={cloud2} style={[styles.cloud, { top: cloud2Top, transform: [{ translateX: cloud2Animation }] }]} resizeMode="contain" />

                    {starAnimations.map((star, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.star,
                                {
                                    top: star.top,
                                    left: star.left,
                                    opacity: star.opacity,
                                    transform: [{ scale: star.scale }],
                                },
                            ]}
                        />
                    ))}

                    <View style={styles.bambooContainer}>
                        {renderBambooStack}
                    </View>
                    <Image source={pandaImage} style={[styles.pandaImage, { width: width * 0.2, height: height * 0.2 }]} resizeMode="contain" />
                    {renderBambooImages}
                </ImageBackground>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundContainer: { flex: 1 },
    scrollContainer: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
    background: { flex: 1, width: '100%' },
    fixedInfoContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        alignItems: 'flex-end',
        zIndex: 1,
    },
    levelText: { fontSize: 18, fontWeight: 'bold' },
    treeNameText: { fontSize: 20, fontWeight: 'bold' },
    cloud: {
        position: 'absolute',
        width: '25%',
        height: '25%',
    },
    star: {
        position: 'absolute',
        width: 2,
        height: 2,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    bambooContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute',
        bottom: '3%',
        left: '25%',
    },
    pandaImage: {
        position: 'absolute',
        bottom: '8%',
        left: '25%',
    },
    bambooBody: {
        alignSelf: 'center',
    },
    bambooHead: {
        alignSelf: 'center',
    },
    bamboo: {
        position: 'absolute',
        left: '10%',
    },
});
