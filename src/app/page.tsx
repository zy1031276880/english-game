'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ==================== 游戏数据定义 ====================

// 旅游城市/地点
const CITIES = [
  { 
    id: 'newyork', 
    nameKey: 'city.newyork',
    emoji: '🗽', 
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    descKey: 'city.newyork.desc',
    scenes: ['airport', 'hotel', 'restaurant', 'shopping', 'subway']
  },
  { 
    id: 'losangeles', 
    nameKey: 'city.losangeles',
    emoji: '🎬', 
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
    descKey: 'city.losangeles.desc',
    requireLevel: 5,
    scenes: ['airport', 'hotel', 'beach', 'studio', 'restaurant']
  },
  { 
    id: 'sanfrancisco', 
    nameKey: 'city.sanfrancisco',
    emoji: '🌉', 
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    descKey: 'city.sanfrancisco.desc',
    requireLevel: 10,
    scenes: ['airport', 'hotel', 'tech_company', 'restaurant', 'sightseeing']
  },
  { 
    id: 'london', 
    nameKey: 'city.london',
    emoji: '🎡', 
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
    descKey: 'city.london.desc',
    requireLevel: 15,
    scenes: ['airport', 'hotel', 'museum', 'pub', 'sightseeing']
  },
  { 
    id: 'tokyo', 
    nameKey: 'city.tokyo',
    emoji: '🗼', 
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
    descKey: 'city.tokyo.desc',
    requireLevel: 20,
    scenes: ['airport', 'hotel', 'restaurant', 'temple', 'shopping']
  },
  { 
    id: 'paris', 
    nameKey: 'city.paris',
    emoji: '🗼', 
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #831843 0%, #db2777 100%)',
    descKey: 'city.paris.desc',
    requireLevel: 25,
    scenes: ['airport', 'hotel', 'museum', 'restaurant', 'shopping']
  },
  { 
    id: 'sydney', 
    nameKey: 'city.sydney',
    emoji: '🦘', 
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, #164e63 0%, #0891b2 100%)',
    descKey: 'city.sydney.desc',
    requireLevel: 30,
    scenes: ['airport', 'hotel', 'beach', 'restaurant', 'sightseeing']
  },
]

// 场景类型（扩展：包含背景配置）
const SCENE_TYPES: Record<string, { 
  nameKey: string; 
  emoji: string; 
  icon: string;
  background: {
    gradient: string;
    pattern?: string;
    ambientColor?: string;
  };
}> = {
  airport: { 
    nameKey: 'scene.airport', 
    emoji: '✈️', 
    icon: '🛫',
    background: {
      gradient: 'linear-gradient(180deg, #1e3a5f 0%, #2d5a87 30%, #4a7c9b 60%, #87ceeb 100%)',
      pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)',
      ambientColor: 'rgba(135, 206, 235, 0.3)'
    }
  },
  hotel: { 
    nameKey: 'scene.hotel', 
    emoji: '🏨', 
    icon: '🛏️',
    background: {
      gradient: 'linear-gradient(180deg, #4a3728 0%, #8b6914 30%, #c9a227 60%, #f5deb3 100%)',
      pattern: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)',
      ambientColor: 'rgba(201, 162, 39, 0.2)'
    }
  },
  restaurant: { 
    nameKey: 'scene.restaurant', 
    emoji: '🍽️', 
    icon: '🍴',
    background: {
      gradient: 'linear-gradient(180deg, #2d1f1f 0%, #5c3d3d 30%, #8b5a5a 60%, #d4a574 100%)',
      pattern: 'radial-gradient(circle at 50% 0%, rgba(255,200,100,0.15) 0%, transparent 50%)',
      ambientColor: 'rgba(212, 165, 116, 0.25)'
    }
  },
  shopping: { 
    nameKey: 'scene.shopping', 
    emoji: '🛍️', 
    icon: '💳',
    background: {
      gradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #e94560 100%)',
      pattern: 'radial-gradient(circle at 30% 30%, rgba(233,69,96,0.1) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(15,52,96,0.2) 0%, transparent 40%)',
      ambientColor: 'rgba(233, 69, 96, 0.15)'
    }
  },
  subway: { 
    nameKey: 'scene.subway', 
    emoji: '🚇', 
    icon: '🎫',
    background: {
      gradient: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 30%, #2d2d2d 60%, #404040 100%)',
      pattern: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.02) 50px, rgba(255,255,255,0.02) 100px)',
      ambientColor: 'rgba(255, 255, 255, 0.05)'
    }
  },
  beach: { 
    nameKey: 'scene.beach', 
    emoji: '🏖️', 
    icon: '🏄',
    background: {
      gradient: 'linear-gradient(180deg, #87ceeb 0%, #00bfff 30%, #20b2aa 60%, #f4a460 100%)',
      pattern: 'radial-gradient(ellipse at 50% 100%, rgba(244,164,96,0.3) 0%, transparent 60%)',
      ambientColor: 'rgba(135, 206, 235, 0.3)'
    }
  },
  studio: { 
    nameKey: 'scene.studio', 
    emoji: '🎬', 
    icon: '🎥',
    background: {
      gradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 30%, #2a2a2a 60%, #3a3a3a 100%)',
      pattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)',
      ambientColor: 'rgba(255, 215, 0, 0.1)'
    }
  },
  tech_company: { 
    nameKey: 'scene.tech_company', 
    emoji: '💻', 
    icon: '🖥️',
    background: {
      gradient: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 30%, #2d2d5a 60%, #4a4a8a 100%)',
      pattern: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)',
      ambientColor: 'rgba(0, 255, 255, 0.1)'
    }
  },
  sightseeing: { 
    nameKey: 'scene.sightseeing', 
    emoji: '📸', 
    icon: '🗼',
    background: {
      gradient: 'linear-gradient(180deg, #4169e1 0%, #6495ed 30%, #87ceeb 60%, #98fb98 100%)',
      pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,0,0.2) 0%, transparent 30%)',
      ambientColor: 'rgba(100, 149, 237, 0.2)'
    }
  },
  museum: { 
    nameKey: 'scene.museum', 
    emoji: '🏛️', 
    icon: '🎨',
    background: {
      gradient: 'linear-gradient(180deg, #2c1810 0%, #5c3a21 30%, #8b5a2b 60%, #d2b48c 100%)',
      pattern: 'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.02) 60px, rgba(255,255,255,0.02) 120px)',
      ambientColor: 'rgba(210, 180, 140, 0.2)'
    }
  },
  pub: { 
    nameKey: 'scene.pub', 
    emoji: '🍺', 
    icon: '🍻',
    background: {
      gradient: 'linear-gradient(180deg, #1a0f0a 0%, #3d2914 30%, #6b4423 60%, #8b6914 100%)',
      pattern: 'radial-gradient(circle at 50% 0%, rgba(255,215,0,0.1) 0%, transparent 50%)',
      ambientColor: 'rgba(139, 105, 20, 0.2)'
    }
  },
  temple: { 
    nameKey: 'scene.temple', 
    emoji: '⛩️', 
    icon: '🎋',
    background: {
      gradient: 'linear-gradient(180deg, #1a2f1a 0%, #2d4a2d 30%, #4a7c4a 60%, #8fbc8f 100%)',
      pattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 40%)',
      ambientColor: 'rgba(143, 188, 143, 0.2)'
    }
  },
}

// 对话场景库
const DIALOG_SCENES: Record<string, DialogScene[]> = {
  airport: [
    {
      id: 'airport_customs',
      titleKey: 'dialog.airport_customs',
      emoji: '🛂',
      difficulty: 1,
      descKey: 'dialog.airport_customs.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.customs_officer',
          speakerEmoji: '🧑‍✈️',
          text: "Good morning. May I see your passport, please?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Here you go.", correct: true, next: 2, translation: "给你。" },
            { text: "I don't have it.", correct: false, feedbackKey: 'feedback.passport_needed', translation: "我没有。" },
            { text: "What do you want?", correct: false, feedbackKey: 'feedback.not_polite', translation: "你想要什么？" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.customs_officer',
          speakerEmoji: '🧑‍✈️',
          text: "What's the purpose of your visit?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'm here for vacation.", correct: true, next: 4, card: 'vacation', translation: "我是来度假的。" },
            { text: "I'm here to work.", correct: false, feedbackKey: 'feedback.tourist_visa', translation: "我是来工作的。" },
            { text: "Just looking around.", correct: false, feedbackKey: 'feedback.not_formal', translation: "只是到处看看。" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.customs_officer',
          speakerEmoji: '🧑‍✈️',
          text: "How long will you be staying?",
        },
        {
          speaker: 'player',
          options: [
            { text: "About two weeks.", correct: true, next: 6, card: 'duration', translation: "大约两周。" },
            { text: "I don't know yet.", correct: false, feedbackKey: 'feedback.specify_duration', translation: "我还不知道。" },
            { text: "Forever!", correct: false, feedbackKey: 'feedback.visa_limit', translation: "永远！" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.customs_officer',
          speakerEmoji: '🧑‍✈️',
          text: "Enjoy your stay! Next, please.",
          isEnd: true,
          reward: { exp: 50, coins: 100 }
        }
      ]
    },
    {
      id: 'airport_checkin',
      titleKey: 'dialog.airport_checkin',
      emoji: '🧳',
      difficulty: 1,
      descKey: 'dialog.airport_checkin.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.ground_staff',
          speakerEmoji: '👩‍✈️',
          text: "Good morning! Where are you flying to today?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'm flying to New York.", correct: true, next: 1, translation: "我要飞往纽约。" },
            { text: "I want a window seat.", correct: false, feedbackKey: 'feedback.answer_destination', translation: "我想要靠窗的座位。" },
            { text: "Where is the gate?", correct: false, feedbackKey: 'feedback.checkin_first', translation: "登机口在哪里？" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.ground_staff',
          speakerEmoji: '👩‍✈️',
          text: "May I have your passport and booking confirmation, please?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Here they are.", correct: true, next: 2, card: 'documents', translation: "都在这里。" },
            { text: "I lost my passport.", correct: false, feedbackKey: 'feedback.no_passport', translation: "我的护照丢了。" },
            { text: "Do I need them?", correct: false, feedbackKey: 'feedback.need_documents', translation: "我需要它们吗？" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.ground_staff',
          speakerEmoji: '👩‍✈️',
          text: "Would you like a window seat or an aisle seat?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Window seat, please.", correct: true, next: 3, card: 'window_seat', translation: "请给我靠窗的座位。" },
            { text: "Aisle seat, please.", correct: true, next: 3, card: 'aisle_seat', translation: "请给我靠过道的座位。" },
            { text: "Any seat is fine.", correct: true, next: 3, translation: "任何座位都可以。" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.ground_staff',
          speakerEmoji: '👩‍✈️',
          text: "Here's your boarding pass. Gate 15, boarding at 10:30. Have a nice flight!",
          isEnd: true,
          reward: { exp: 40, coins: 80 }
        }
      ]
    },
    {
      id: 'airport_security',
      titleKey: 'dialog.airport_security',
      emoji: '🔍',
      difficulty: 1,
      descKey: 'dialog.airport_security.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.security_officer',
          speakerEmoji: '👮',
          text: "Please put your laptop and liquids in the bin. Take off your belt and jacket.",
        },
        {
          speaker: 'player',
          options: [
            { text: "Sure, no problem.", correct: true, next: 1, translation: "好的，没问题。" },
            { text: "Why do I need to do that?", correct: false, feedbackKey: 'feedback.cooperate_security', translation: "为什么我需要那样做？" },
            { text: "I don't have any.", correct: false, feedbackKey: 'feedback.check_belongings', translation: "我什么都没有。" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.security_officer',
          speakerEmoji: '👮',
          text: "Please raise your arms. Stay still.",
        },
        {
          speaker: 'player',
          options: [
            { text: "Okay.", correct: true, next: 2, translation: "好的。" },
            { text: "Is this necessary?", correct: false, feedbackKey: 'feedback.standard_procedure', translation: "这有必要吗？" },
            { text: "It tickles!", correct: false, feedbackKey: 'feedback.stay_still', translation: "好痒！" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.security_officer',
          speakerEmoji: '👮',
          text: "You're all clear. Have a safe trip!",
          isEnd: true,
          reward: { exp: 35, coins: 70 }
        }
      ]
    },
    {
      id: 'airport_lost_luggage',
      titleKey: 'dialog.airport_baggage',
      emoji: '📦',
      difficulty: 2,
      descKey: 'dialog.airport_baggage.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.baggage_service',
          speakerEmoji: '👨‍💼',
          text: "Good afternoon. How can I help you?",
        },
        {
          speaker: 'player',
          options: [
            { text: "My luggage didn't arrive.", correct: true, next: 1, card: 'problem', translation: "我的行李没到。" },
            { text: "I want to complain.", correct: false, feedbackKey: 'feedback.describe_problem', translation: "我要投诉。" },
            { text: "Where is the bathroom?", correct: false, feedbackKey: 'feedback.not_luggage_service', translation: "洗手间在哪里？" },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.baggage_service',
          speakerEmoji: '👨‍💼',
          text: "I'm sorry to hear that. Can I have your baggage claim tag and passport?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Here you go. It's a blue suitcase.", correct: true, next: 2, card: 'describe_item' },
            { text: "I threw away the tag.", correct: false, feedbackKey: 'feedback.baggage_tag' },
            { text: "It was a big bag.", correct: false, feedbackKey: 'feedback.detailed_description' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.baggage_service',
          speakerEmoji: '👨‍💼',
          text: "We'll track it down and deliver it to your hotel. Please fill out this form with your contact information.",
          isEnd: true,
          reward: { exp: 60, coins: 150 }
        }
      ]
    },
    {
      id: 'airport_boarding',
      titleKey: 'dialog.airport_boarding',
      emoji: '💺',
      difficulty: 1,
      descKey: 'dialog.airport_boarding.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.flight_attendant',
          speakerEmoji: '👩‍✈️',
          text: "Welcome aboard! May I see your boarding pass?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Here it is.", correct: true, next: 1 },
            { text: "Where's my seat?", correct: false, feedbackKey: 'feedback.show_boarding_pass' },
            { text: "I'm hungry.", correct: false, feedbackKey: 'feedback.not_taken_off' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.flight_attendant',
          speakerEmoji: '👩‍✈️',
          text: "Your seat is 12A, a window seat. Go straight back and turn left.",
        },
        {
          speaker: 'player',
          options: [
            { text: "Thank you!", correct: true, next: 2, card: 'thanks' },
            { text: "Can I change my seat?", correct: true, next: 2 },
            { text: "I don't understand.", correct: false, feedbackKey: 'feedback.straight_left' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.flight_attendant',
          speakerEmoji: '👩‍✈️',
          text: "You're welcome. Please fasten your seatbelt for takeoff. Enjoy your flight!",
          isEnd: true,
          reward: { exp: 30, coins: 60 }
        }
      ]
    },
  ],
  hotel: [
    {
      id: 'hotel_checkin',
      titleKey: 'dialog.hotel_checkin',
      emoji: '🏨',
      difficulty: 1,
      descKey: 'dialog.hotel_checkin.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.receptionist',
          speakerEmoji: '👨‍💼',
          text: "Good evening! Welcome to Grand Hotel. Do you have a reservation?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Yes, under Smith.", correct: true, next: 1, card: 'reservation' },
            { text: "I want the best room.", correct: false, feedbackKey: 'feedback.confirm_reservation' },
            { text: "What's the WiFi password?", correct: false, feedbackKey: 'feedback.not_checked_in' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.receptionist',
          speakerEmoji: '👨‍💼',
          text: "Perfect! I found your reservation. A double room for 3 nights. May I see your ID?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Here's my passport.", correct: true, next: 2 },
            { text: "Do I need to pay now?", correct: false, feedbackKey: 'feedback.show_id' },
            { text: "Can I upgrade my room?", correct: false, feedbackKey: 'feedback.complete_checkin' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.receptionist',
          speakerEmoji: '👨‍💼',
          text: "Here's your key card. Room 505 on the 5th floor. Breakfast is served from 7 to 10 AM in the restaurant. Is there anything else you need?",
        },
        {
          speaker: 'player',
          options: [
            { text: "What time is checkout?", correct: true, next: 3 },
            { text: "Is there a gym?", correct: true, next: 3 },
            { text: "That's all.", correct: true, next: 3 },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.receptionist',
          speakerEmoji: '👨‍💼',
          text: "Checkout is at 11 AM. Enjoy your stay!",
          isEnd: true,
          reward: { exp: 45, coins: 90 }
        }
      ]
    },
    {
      id: 'hotel_room_service',
      titleKey: 'dialog.hotel_service',
      emoji: '🛎️',
      difficulty: 1,
      descKey: 'dialog.hotel_service.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.room_service',
          speakerEmoji: '🧑‍🍳',
          text: "Room service, how may I help you?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'd like to order some food.", correct: true, next: 1, card: 'order_food' },
            { text: "My room is dirty.", correct: false, feedbackKey: 'feedback.rude_way' },
            { text: "Bring me water.", correct: false, feedbackKey: 'feedback.be_polite' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.room_service',
          speakerEmoji: '🧑‍🍳',
          text: "Certainly! What would you like to order?",
        },
        {
          speaker: 'player',
          options: [
            { text: "A club sandwich and a coke, please.", correct: true, next: 2, card: 'food_order' },
            { text: "What do you recommend?", correct: true, next: 2 },
            { text: "I don't know the menu.", correct: false, feedbackKey: 'feedback.ask_recommendation' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.room_service',
          speakerEmoji: '🧑‍🍳',
          text: "That will be $25. It will be delivered in about 20 minutes. Is there anything else?",
        },
        {
          speaker: 'player',
          options: [
            { text: "No, that's all. Thank you.", correct: true, next: 3 },
            { text: "Can I pay by card?", correct: true, next: 3 },
            { text: "That's expensive!", correct: false, feedbackKey: 'feedback.us_tips' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.room_service',
          speakerEmoji: '🧑‍🍳',
          text: "Thank you! Your order will arrive shortly.",
          isEnd: true,
          reward: { exp: 35, coins: 70 }
        }
      ]
    },
    {
      id: 'hotel_complaint',
      titleKey: 'dialog.hotel_complaint',
      emoji: '🔧',
      difficulty: 2,
      descKey: 'dialog.hotel_complaint.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.front_desk',
          speakerEmoji: '👨‍💼',
          text: "Front desk, how may I help you?",
        },
        {
          speaker: 'player',
          options: [
            { text: "There's a problem with my room.", correct: true, next: 1 },
            { text: "This hotel is terrible!", correct: false, feedbackKey: 'feedback.be_specific' },
            { text: "I want a refund.", correct: false, feedbackKey: 'feedback.say_return' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.front_desk',
          speakerEmoji: '👨‍💼',
          text: "I'm sorry to hear that. What seems to be the problem?",
        },
        {
          speaker: 'player',
          options: [
            { text: "The air conditioning isn't working.", correct: true, next: 2, card: 'complaint' },
            { text: "The room is too small.", correct: false, feedbackKey: 'feedback.room_type' },
            { text: "I just don't like it.", correct: false, feedbackKey: 'feedback.need_reason' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.front_desk',
          speakerEmoji: '👨‍💼',
          text: "I apologize for the inconvenience. I'll send someone to fix it right away. Would you like to change to another room?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Yes, please.", correct: true, next: 3, card: 'solution' },
            { text: "No, just fix it.", correct: true, next: 3 },
            { text: "I want compensation!", correct: false, feedbackKey: 'feedback.try_solve' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.front_desk',
          speakerEmoji: '👨‍💼',
          text: "We'll take care of it immediately. Thank you for your patience.",
          isEnd: true,
          reward: { exp: 55, coins: 120 }
        }
      ]
    },
  ],
  restaurant: [
    {
      id: 'restaurant_arrival',
      titleKey: 'dialog.restaurant_order',
      emoji: '🍽️',
      difficulty: 1,
      descKey: 'dialog.restaurant_order.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Good evening! Table for how many?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Just me, please.", correct: true, next: 1 },
            { text: "Two, please.", correct: true, next: 1 },
            { text: "I want food.", correct: false, feedbackKey: 'feedback.answer_count' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Right this way. Here's your menu. Can I get you something to drink?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'll have water, please.", correct: true, next: 2, card: 'drink' },
            { text: "What do you recommend?", correct: true, next: 2 },
            { text: "Free water?", correct: false, feedbackKey: 'feedback.ask_politely' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Are you ready to order?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'll have the steak, medium rare.", correct: true, next: 3, card: 'steak_order' },
            { text: "Give me food.", correct: false, feedbackKey: 'feedback.specify_dish' },
            { text: "What's the special today?", correct: true, next: 3 },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Excellent choice! How would you like your steak cooked?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Medium rare, please.", correct: true, next: 4 },
            { text: "Well done.", correct: true, next: 4 },
            { text: "I don't know.", correct: false, feedbackKey: 'feedback.ask_doneness' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Your order will be ready shortly. Enjoy your meal!",
          isEnd: true,
          reward: { exp: 40, coins: 80 }
        }
      ]
    },
    {
      id: 'restaurant_complaint',
      titleKey: 'dialog.restaurant_complaint',
      emoji: '😤',
      difficulty: 2,
      descKey: 'dialog.restaurant_complaint.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "How is everything? Is everything to your satisfaction?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Actually, this steak is overcooked.", correct: true, next: 1, card: 'complain' },
            { text: "This is terrible!", correct: false, feedbackKey: 'feedback.express_politely' },
            { text: "It's fine.", correct: false, feedbackKey: 'feedback.wont_solve' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "I apologize for that. Would you like me to have it recooked?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Yes, please. Medium rare this time.", correct: true, next: 2, card: 'solution' },
            { text: "I want a refund!", correct: false, feedbackKey: 'feedback.try_different' },
            { text: "Never mind.", correct: false, feedbackKey: 'feedback.persist' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "I'm sorry for the inconvenience. I'll bring you a new one right away. Would you like a complimentary dessert?",
        },
        {
          speaker: 'player',
          options: [
            { text: "That would be nice, thank you.", correct: true, next: 3 },
            { text: "Just fix the steak.", correct: true, next: 3 },
            { text: "I want to see the manager!", correct: false, feedbackKey: 'feedback.accept_compensation' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Thank you for your understanding. Your new steak will arrive in 10 minutes.",
          isEnd: true,
          reward: { exp: 55, coins: 120 }
        }
      ]
    },
    {
      id: 'restaurant_payment',
      titleKey: 'dialog.restaurant_payment',
      emoji: '💳',
      difficulty: 1,
      descKey: 'dialog.restaurant_payment.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Would you like anything else?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Just the check, please.", correct: true, next: 1, card: 'payment' },
            { text: "I'm done.", correct: false, feedbackKey: 'feedback.ask_bill_politely' },
            { text: "More water.", correct: true, next: 1 },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Here's your bill. How would you like to pay?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Credit card, please.", correct: true, next: 2 },
            { text: "Cash.", correct: true, next: 2 },
            { text: "Can I split the bill?", correct: true, next: 2 },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Would you like to leave a tip?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Yes, 15%.", correct: true, next: 3 },
            { text: "No, thank you.", correct: true, next: 3 },
            { text: "What's a tip?", correct: false, feedbackKey: 'feedback.us_tips' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.waiter',
          speakerEmoji: '👨‍🍳',
          text: "Thank you! Have a great day!",
          isEnd: true,
          reward: { exp: 30, coins: 60 }
        }
      ]
    },
  ],
  shopping: [
    {
      id: 'shopping_clothes',
      titleKey: 'dialog.shopping_clothes',
      emoji: '👔',
      difficulty: 1,
      descKey: 'dialog.shopping_clothes.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "Hi there! Can I help you find something?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'm looking for a jacket.", correct: true, next: 1, card: 'shopping_intent' },
            { text: "Just browsing.", correct: true, next: 1 },
            { text: "How much is this?", correct: false, feedbackKey: 'feedback.what_to_see' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "Sure! What size are you looking for?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Medium, please.", correct: true, next: 2, card: 'size' },
            { text: "I don't know.", correct: false, feedbackKey: 'feedback.ask_try_on' },
            { text: "The biggest one.", correct: false, feedbackKey: 'feedback.know_size' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "Here's a nice one. Would you like to try it on? The fitting room is over there.",
        },
        {
          speaker: 'player',
          options: [
            { text: "Yes, thank you.", correct: true, next: 3, card: 'try_on' },
            { text: "I'll take it.", correct: true, next: 3 },
            { text: "It looks ugly.", correct: false, feedbackKey: 'feedback.express_politely' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "How does it fit?",
        },
        {
          speaker: 'player',
          options: [
            { text: "It fits perfectly! I'll take it.", correct: true, next: 4, card: 'purchase' },
            { text: "Do you have it in blue?", correct: true, next: 4 },
            { text: "Too expensive.", correct: false, feedbackKey: 'feedback.ask_discount' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "Great choice! That will be $89.99. Will that be cash or card?",
          isEnd: true,
          reward: { exp: 45, coins: 90 }
        }
      ]
    },
    {
      id: 'shopping_return',
      titleKey: 'dialog.shopping_return',
      emoji: '🔄',
      difficulty: 2,
      descKey: 'dialog.shopping_return.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "Hello! How can I help you today?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'd like to return this.", correct: true, next: 1, card: 'return' },
            { text: "I want my money back!", correct: false, feedbackKey: 'feedback.express_politely' },
            { text: "This is broken.", correct: false, feedbackKey: 'feedback.say_return' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "Do you have the receipt?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Yes, here it is.", correct: true, next: 2 },
            { text: "I lost it.", correct: false, feedbackKey: 'feedback.receipt_important' },
            { text: "Do I need it?", correct: false, feedbackKey: 'feedback.need_receipt' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "What's the reason for the return?",
        },
        {
          speaker: 'player',
          options: [
            { text: "It doesn't fit.", correct: true, next: 3 },
            { text: "It was a gift.", correct: true, next: 3 },
            { text: "I just don't like it.", correct: true, next: 3 },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "Would you like a refund or an exchange?",
        },
        {
          speaker: 'player',
          options: [
            { text: "A refund, please.", correct: true, next: 4 },
            { text: "I'd like to exchange it.", correct: true, next: 4 },
            { text: "Store credit is fine.", correct: true, next: 4 },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.shop_assistant',
          speakerEmoji: '👩‍💼',
          text: "I've processed your return. Here's your refund. Is there anything else?",
          isEnd: true,
          reward: { exp: 50, coins: 100 }
        }
      ]
    },
  ],
  interview: [
    {
      id: 'interview_intro',
      titleKey: 'dialog.interview_intro',
      emoji: '🎤',
      difficulty: 1,
      descKey: 'dialog.interview_intro.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.interviewer',
          speakerEmoji: '👨‍💼',
          text: "Good morning. Thank you for coming in today. Can you tell me a little about yourself?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'm a software engineer with 5 years of experience.", correct: true, next: 1, card: 'self_intro_pro' },
            { text: "I was born in a small town...", correct: false, feedbackKey: 'feedback.interview_relevance' },
            { text: "What do you want to know?", correct: false, feedbackKey: 'feedback.introduce_self' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.interviewer',
          speakerEmoji: '👨‍💼',
          text: "That's interesting. What are your greatest strengths?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'm detail-oriented and a quick learner.", correct: true, next: 2, card: 'strength' },
            { text: "I'm perfect at everything.", correct: false, feedbackKey: 'feedback.too_arrogant' },
            { text: "I don't have any.", correct: false, feedbackKey: 'feedback.everyone_has_strengths' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.interviewer',
          speakerEmoji: '👨‍💼',
          text: "What about your weaknesses?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I sometimes focus too much on details, but I'm working on that.", correct: true, next: 3, card: 'weakness' },
            { text: "I have no weaknesses.", correct: false, feedbackKey: 'feedback.nobody_perfect' },
            { text: "I'm always late.", correct: false, feedbackKey: 'feedback.fatal_weakness' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.interviewer',
          speakerEmoji: '👨‍💼',
          text: "Thank you for sharing. Do you have any questions for us?",
          isEnd: true,
          reward: { exp: 80, coins: 200 }
        }
      ]
    },
    {
      id: 'interview_technical',
      titleKey: 'dialog.interview_tech',
      emoji: '💻',
      difficulty: 2,
      descKey: 'dialog.interview_tech.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.tech_interviewer',
          speakerEmoji: '👨‍💻',
          text: "Let's discuss your technical experience. What programming languages are you proficient in?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I'm proficient in Python, JavaScript, and Go.", correct: true, next: 1, card: 'tech_skill' },
            { text: "I know a little bit of everything.", correct: false, feedbackKey: 'feedback.show_depth' },
            { text: "I'm still learning.", correct: false, feedbackKey: 'feedback.show_skills' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.tech_interviewer',
          speakerEmoji: '👨‍💻',
          text: "Can you describe a challenging project you worked on?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I led a team to rebuild our payment system, reducing processing time by 40%.", correct: true, next: 2, card: 'project' },
            { text: "I once fixed a bug.", correct: false, feedbackKey: 'feedback.specific_project' },
            { text: "I prefer not to talk about work.", correct: false, feedbackKey: 'feedback.show_experience' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.tech_interviewer',
          speakerEmoji: '👨‍💻',
          text: "Impressive! How do you handle tight deadlines?",
        },
        {
          speaker: 'player',
          options: [
            { text: "I prioritize tasks and communicate early if there are blockers.", correct: true, next: 3, card: 'teamwork' },
            { text: "I work 24/7 until it's done.", correct: false, feedbackKey: 'feedback.sustainability' },
            { text: "I just give up.", correct: false, feedbackKey: 'feedback.not_good_answer' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.tech_interviewer',
          speakerEmoji: '👨‍💻',
          text: "Great answers! We'll be in touch soon.",
          isEnd: true,
          reward: { exp: 100, coins: 300 }
        }
      ]
    },
    {
      id: 'interview_salary',
      titleKey: 'dialog.interview_salary',
      emoji: '💰',
      difficulty: 3,
      descKey: 'dialog.interview_salary.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.hr',
          speakerEmoji: '👩‍💼',
          text: "We'd like to offer you the position. What are your salary expectations?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Based on my research, I'm looking for $X to $Y.", correct: true, next: 1, card: 'salary' },
            { text: "How much are you offering?", correct: false, feedbackKey: 'feedback.state_expectation' },
            { text: "I'll take anything!", correct: false, feedbackKey: 'feedback.show_value' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.hr',
          speakerEmoji: '👩‍💼',
          text: "That's a bit higher than our budget. Would you consider $Z?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Could we meet in the middle?", correct: true, next: 2 },
            { text: "That's too low.", correct: false, feedbackKey: 'feedback.try_negotiate' },
            { text: "Okay, I accept.", correct: false, feedbackKey: 'feedback.negotiate' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.hr',
          speakerEmoji: '👩‍💼',
          text: "We can offer $X plus a sign-on bonus. How does that sound?",
        },
        {
          speaker: 'player',
          options: [
            { text: "That sounds great! I accept.", correct: true, next: 3 },
            { text: "Can I have time to think about it?", correct: true, next: 3 },
            { text: "I want more benefits.", correct: false, feedbackKey: 'feedback.accept_offer' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.hr',
          speakerEmoji: '👩‍💼',
          text: "Welcome to the team! We'll send you the offer letter shortly.",
          isEnd: true,
          reward: { exp: 120, coins: 400 }
        }
      ]
    },
  ],
  subway: [
    {
      id: 'subway_ticket',
      titleKey: 'dialog.subway_ticket',
      emoji: '🎫',
      difficulty: 1,
      descKey: 'dialog.subway_ticket.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.ticket_machine',
          speakerEmoji: '🎫',
          text: "Welcome. Select your destination and ticket type.",
        },
        {
          speaker: 'player',
          options: [
            { text: "One-way to Times Square.", correct: true, next: 1 },
            { text: "I need help.", correct: true, next: 1 },
            { text: "Free ticket?", correct: false, feedbackKey: 'feedback.subway_not_free' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.ticket_machine',
          speakerEmoji: '🎫',
          text: "That will be $2.75. Please insert payment.",
        },
        {
          speaker: 'player',
          options: [
            { text: "Card.", correct: true, next: 2 },
            { text: "Cash.", correct: true, next: 2 },
            { text: "I don't have money.", correct: false, feedbackKey: 'feedback.subway_need_pay' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.ticket_machine',
          speakerEmoji: '🎫',
          text: "Ticket printed. Thank you. Have a nice trip!",
          isEnd: true,
          reward: { exp: 25, coins: 50 }
        }
      ]
    },
    {
      id: 'subway_directions',
      titleKey: 'dialog.subway_directions',
      emoji: '🗺️',
      difficulty: 1,
      descKey: 'dialog.subway_directions.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.passerby',
          speakerEmoji: '🧑',
          text: "Excuse me, can I help you?",
        },
        {
          speaker: 'player',
          options: [
            { text: "How do I get to Central Park?", correct: true, next: 1, card: 'ask_directions' },
            { text: "Where am I?", correct: false, feedbackKey: 'feedback.check_signs' },
            { text: "I'm lost!", correct: false, feedbackKey: 'feedback.specific_destination' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.passerby',
          speakerEmoji: '🧑',
          text: "Take the uptown A train to 59th Street. It's about 10 minutes from here.",
        },
        {
          speaker: 'player',
          options: [
            { text: "Thank you very much!", correct: true, next: 2 },
            { text: "Which platform?", correct: true, next: 2 },
            { text: "That's too complicated.", correct: false, feedbackKey: 'feedback.subway_fastest' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.passerby',
          speakerEmoji: '🧑',
          text: "You're welcome! Enjoy your visit!",
          isEnd: true,
          reward: { exp: 30, coins: 60 }
        }
      ]
    },
  ],
  beach: [
    {
      id: 'beach_rental',
      titleKey: 'dialog.beach_rental',
      emoji: '🏄',
      difficulty: 1,
      descKey: 'dialog.beach_rental.desc',
      dialog: [
        {
          speaker: 'npc',
          speakerNameKey: 'npc.rental_staff',
          speakerEmoji: '🧑‍💼',
          text: "Hi! Looking to rent some beach equipment?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Yes, I need a surfboard.", correct: true, next: 1, card: 'rental' },
            { text: "How much for an umbrella?", correct: true, next: 1 },
            { text: "Is this free?", correct: false, feedbackKey: 'feedback.rental_fees' },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.rental_staff',
          speakerEmoji: '🧑‍💼',
          text: "Sure! We have surfboards for $20/hour or $50/day. How long do you need it?",
        },
        {
          speaker: 'player',
          options: [
            { text: "Just for an hour, please.", correct: true, next: 2 },
            { text: "For the whole day.", correct: true, next: 2 },
            { text: "Can I get a discount?", correct: true, next: 2 },
          ]
        },
        {
          speaker: 'npc',
          speakerNameKey: 'npc.rental_staff',
          speakerEmoji: '🧑‍💼',
          text: "Here's your board. Please return it by the agreed time. Enjoy the waves!",
          isEnd: true,
          reward: { exp: 35, coins: 70 }
        }
      ]
    },
  ],
}

// 句型卡牌
const CARD_TEMPLATES: CardTemplate[] = [
  // 基础卡牌 - 普通
  { id: 'greeting', nameKey: 'card.greeting', sentence: "How are you doing?", rarity: 'common', category: 'basic', emoji: '👋' },
  { id: 'thanks', nameKey: 'card.thanks', sentence: "Thank you very much!", rarity: 'common', category: 'basic', emoji: '🙏' },
  { id: 'apology', nameKey: 'card.apology', sentence: "I'm sorry for the inconvenience.", rarity: 'common', category: 'basic', emoji: '😅' },
  { id: 'request', nameKey: 'card.request', sentence: "Could you please help me?", rarity: 'common', category: 'basic', emoji: '🤲' },
  { id: 'documents', nameKey: 'card.documents', sentence: "Here are my documents.", rarity: 'common', category: 'travel', emoji: '📄' },
  { id: 'payment', nameKey: 'card.payment', sentence: "I'll pay by card.", rarity: 'common', category: 'shopping', emoji: '💳' },
  { id: 'order_food', nameKey: 'card.order_food', sentence: "I'd like to order...", rarity: 'common', category: 'dining', emoji: '📋' },
  
  // 旅行卡牌 - 稀有
  { id: 'vacation', nameKey: 'card.vacation', sentence: "I'm here for vacation.", rarity: 'uncommon', category: 'travel', emoji: '🏖️' },
  { id: 'duration', nameKey: 'card.duration', sentence: "I'll be staying for two weeks.", rarity: 'uncommon', category: 'travel', emoji: '📅' },
  { id: 'reservation', nameKey: 'card.reservation', sentence: "I have a reservation under Smith.", rarity: 'uncommon', category: 'travel', emoji: '📝' },
  { id: 'window_seat', nameKey: 'card.window_seat', sentence: "I'd prefer a window seat.", rarity: 'uncommon', category: 'travel', emoji: '💺' },
  { id: 'aisle_seat', nameKey: 'card.aisle_seat', sentence: "I'd prefer an aisle seat.", rarity: 'uncommon', category: 'travel', emoji: '🚶' },
  { id: 'ask_directions', nameKey: 'card.ask_directions', sentence: "How do I get to...?", rarity: 'uncommon', category: 'travel', emoji: '🗺️' },
  { id: 'rental', nameKey: 'card.rental', sentence: "I'd like to rent...", rarity: 'uncommon', category: 'travel', emoji: '🏄' },
  
  // 餐饮卡牌 - 稀有
  { id: 'drink', nameKey: 'card.drink', sentence: "I'll have water, please.", rarity: 'uncommon', category: 'dining', emoji: '🥤' },
  { id: 'steak_order', nameKey: 'card.steak_order', sentence: "I'll have the steak, medium rare.", rarity: 'rare', category: 'dining', emoji: '🥩' },
  { id: 'complain', nameKey: 'card.complain', sentence: "There's a problem with...", rarity: 'rare', category: 'dining', emoji: '⚠️' },
  { id: 'solution', nameKey: 'card.solution', sentence: "Could you please fix this?", rarity: 'rare', category: 'dining', emoji: '🔧' },
  
  // 购物卡牌 - 稀有
  { id: 'shopping_intent', nameKey: 'card.shopping_intent', sentence: "I'm looking for...", rarity: 'uncommon', category: 'shopping', emoji: '🔍' },
  { id: 'size', nameKey: 'card.ask_price', sentence: "Do you have this in size M?", rarity: 'uncommon', category: 'shopping', emoji: '📏' },
  { id: 'try_on', nameKey: 'card.try_on', sentence: "Can I try this on?", rarity: 'uncommon', category: 'shopping', emoji: '👔' },
  { id: 'purchase', nameKey: 'card.payment', sentence: "I'll take it.", rarity: 'uncommon', category: 'shopping', emoji: '🛒' },
  { id: 'return', nameKey: 'card.complain', sentence: "I'd like to return this.", rarity: 'rare', category: 'shopping', emoji: '🔄' },
  
  // 面试卡牌 - 史诗/传说
  { id: 'self_intro_pro', nameKey: 'card.interview_intro', sentence: "I'm a [job] with [X] years of experience.", rarity: 'epic', category: 'interview', emoji: '💼' },
  { id: 'strength', nameKey: 'card.strength', sentence: "One of my greatest strengths is...", rarity: 'epic', category: 'interview', emoji: '💪' },
  { id: 'weakness', nameKey: 'card.weakness', sentence: "I sometimes struggle with..., but I'm working on it.", rarity: 'epic', category: 'interview', emoji: '🎯' },
  { id: 'tech_skill', nameKey: 'card.interview_intro', sentence: "I'm proficient in Python and JavaScript.", rarity: 'epic', category: 'interview', emoji: '💻' },
  { id: 'project', nameKey: 'card.interview_intro', sentence: "I led a project that resulted in...", rarity: 'legendary', category: 'interview', emoji: '🏆' },
  { id: 'teamwork', nameKey: 'card.strength', sentence: "I prioritize tasks and communicate with the team.", rarity: 'legendary', category: 'interview', emoji: '🤝' },
  { id: 'salary', nameKey: 'card.salary', sentence: "Based on my research, I'm looking for...", rarity: 'legendary', category: 'interview', emoji: '💰' },
]

// 建筑类型
const BUILDINGS = [
  { id: 'airport', nameKey: 'building.airport', emoji: '✈️', cost: 0, unlockLevel: 1, bonus: { exp: 1.1 }, descKey: 'town.stats' },
  { id: 'hotel', nameKey: 'building.hotel', emoji: '🏨', cost: 500, unlockLevel: 2, bonus: { coins: 1.1 }, descKey: 'town.stats' },
  { id: 'restaurant', nameKey: 'building.restaurant', emoji: '🍽️', cost: 800, unlockLevel: 3, bonus: { exp: 1.15 }, descKey: 'town.stats' },
  { id: 'mall', nameKey: 'building.mall', emoji: '🛍️', cost: 1200, unlockLevel: 5, bonus: { coins: 1.2 }, descKey: 'town.stats' },
  { id: 'office', nameKey: 'building.school', emoji: '🏢', cost: 2000, unlockLevel: 8, bonus: { exp: 1.25 }, descKey: 'town.stats' },
  { id: 'school', nameKey: 'building.school', emoji: '🎓', cost: 3000, unlockLevel: 10, bonus: { cardDrop: 1.2 }, descKey: 'town.stats' },
  { id: 'library', nameKey: 'building.library', emoji: '📚', cost: 5000, unlockLevel: 15, bonus: { exp: 1.3, cardDrop: 1.1 }, descKey: 'town.stats' },
]

// 成就系统
const ACHIEVEMENTS = [
  { id: 'first_trip', nameKey: 'achievement.firstTrip', descKey: 'achievement.firstTrip.desc', emoji: '🌟', reward: 100 },
  { id: 'card_collector', nameKey: 'achievement.cardCollector', descKey: 'achievement.cardCollector.desc', emoji: '🃏', reward: 200 },
  { id: 'card_master', nameKey: 'achievement.cardMaster', descKey: 'achievement.cardMaster.desc', emoji: '👑', reward: 500 },
  { id: 'world_traveler', nameKey: 'achievement.worldTraveler', descKey: 'achievement.worldTraveler.desc', emoji: '🌍', reward: 500 },
  { id: 'interview_master', nameKey: 'achievement.interviewMaster', descKey: 'achievement.interviewMaster.desc', emoji: '💼', reward: 300 },
  { id: 'accuracy_90', nameKey: 'achievement.accuracy', descKey: 'achievement.accuracy.desc', emoji: '🎯', reward: 400 },
  { id: 'scenes_20', nameKey: 'achievement.experienced', descKey: 'achievement.experienced.desc', emoji: '🏅', reward: 300 },
]

// 类型定义
interface DialogScene {
  id: string
  titleKey: string
  emoji: string
  difficulty: number
  descKey?: string
  dialog: DialogLine[]
  // 场景背景配置
  background?: {
    gradient: string        // 背景渐变
    pattern?: string        // 背景图案（CSS）
    ambientColor?: string   // 环境光颜色
  }
  // 场景角色配置
  setting?: {
    location: string        // 场景位置描述
    npcPosition?: 'left' | 'right' | 'center'  // NPC位置
    playerPosition?: 'left' | 'right' | 'center' // 玩家位置
  }
}

interface DialogLine {
  speaker: 'player' | 'npc'
  speakerName?: string
  speakerNameKey?: string
  speakerEmoji?: string
  text?: string
  options?: DialogOption[]
  isEnd?: boolean
  reward?: { exp: number; coins: number }
}

interface DialogOption {
  text: string
  correct: boolean
  feedback?: string
  feedbackKey?: string
  next?: number
  card?: string
  translation?: string // 中文翻译
}

interface CardTemplate {
  id: string
  nameKey: string
  sentence: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: string
  emoji: string
}

interface GameCard extends CardTemplate {
  uniqueId: string
  level: number
}

interface GameState {
  level: number
  exp: number
  coins: number
  currentCity: string
  unlockedCities: string[]
  completedScenes: string[]
  cards: GameCard[]
  buildings: string[]
  achievements: string[]
  stats: {
    scenesCompleted: number
    correctAnswers: number
    totalAnswers: number
    cardsCollected: number
  }
  // 新增：激励系统
  currentStreak: number       // 当前连胜
  maxStreak: number           // 最大连胜
  lastLoginDate: string       // 最后登录日期
  consecutiveLoginDays: number // 连续登录天数
  dailyTasks: {               // 每日任务进度
    [taskId: string]: number
  }
  lastTaskResetDate: string   // 任务重置日期
  // 引导系统
  tutorialStep: number        // 当前引导步骤 (-1 表示已完成)
  // 已回答的对话索引（防止重复计数连胜）
  answeredDialogIndices: number[]
  // 错题本
  wrongAnswers: WrongAnswer[]
}

// 错题记录
interface WrongAnswer {
  id: string
  sceneId: string
  sceneNameKey: string
  cityId: string
  npcName: string
  question: string
  questionTranslation: string
  correctOption: {
    text: string
    translation: string
  }
  userOption: {
    text: string
    translation: string
  }
  timestamp: number
  reviewCount: number  // 复习次数
  lastReviewTime: number  // 最后复习时间
  mastered: boolean  // 是否已掌握
}

// 引导步骤定义
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    titleKey: 'tutorial.welcome.title',
    contentKey: 'tutorial.welcome.content',
    emoji: '🎮',
    position: 'center' as const,
  },
  {
    id: 'map',
    titleKey: 'tutorial.map.title',
    contentKey: 'tutorial.map.content',
    emoji: '🗺️',
    position: 'top' as const,
    target: 'map-tab',
  },
  {
    id: 'scene',
    titleKey: 'tutorial.scene.title',
    contentKey: 'tutorial.scene.content',
    emoji: '🎯',
    position: 'top' as const,
    target: 'scene-area',
  },
  {
    id: 'cards',
    titleKey: 'tutorial.cards.title',
    contentKey: 'tutorial.cards.content',
    emoji: '🃏',
    position: 'top' as const,
    target: 'cards-tab',
  },
  {
    id: 'tasks',
    titleKey: 'tutorial.tasks.title',
    contentKey: 'tutorial.tasks.content',
    emoji: '📅',
    position: 'top' as const,
    target: 'tasks-tab',
  },
  {
    id: 'achievements',
    titleKey: 'tutorial.achievements.title',
    contentKey: 'tutorial.achievements.content',
    emoji: '🏆',
    position: 'top' as const,
    target: 'achievements-tab',
  },
]

interface FloatingText {
  id: string
  text: string
  type: 'exp' | 'coin' | 'card' | 'correct' | 'wrong' | 'streak' | 'levelup'
  x: number
  y: number
}

interface LogItem {
  id: string
  text: string
  type: 'normal' | 'success' | 'warning' | 'error'
  time: string
}

type Tab = 'map' | 'cards' | 'city' | 'interview' | 'tasks' | 'achievements' | 'rankings' | 'wrongAnswers'
type GameMode = 'menu' | 'dialog' | 'result' | 'wrongAnswers'

// 工具函数
const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

const RARITY_NAMES: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

const formatNumber = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

// ==================== 鼓励系统 ====================

// 鼓励语
const ENCOURAGEMENTS = {
  correct: [
    "encourage.correct1",
    "encourage.correct2",
    "encourage.correct3",
    "encourage.correct4",
    "encourage.correct5",
    "encourage.correct6",
    "encourage.correct7",
    "encourage.correct8",
  ],
  wrong: [
    "encourage.wrong1",
    "encourage.wrong2",
    "encourage.wrong3",
    "encourage.wrong4",
    "encourage.wrong5",
  ],
  streak: {
    3: "encourage.streak3",
    5: "encourage.streak5",
    7: "encourage.streak7",
    10: "encourage.streak10",
  },
  levelUp: [
    "encourage.levelUp1",
    "encourage.levelUp2",
    "encourage.levelUp3",
    "encourage.levelUp4",
  ]
}

// 每日任务
const DAILY_TASKS = [
  { id: 'complete_scene', nameKey: 'tasks.completeScene', target: 1, reward: { exp: 20, coins: 30 }, emoji: '🎮' },
  { id: 'correct_answers', nameKey: 'tasks.correctAnswers5', target: 5, reward: { exp: 30, coins: 50 }, emoji: '✅' },
  { id: 'collect_card', nameKey: 'tasks.collectCard', target: 1, reward: { exp: 25, coins: 40 }, emoji: '🃏' },
  { id: 'streak_5', nameKey: 'tasks.streak5', target: 5, reward: { exp: 50, coins: 80 }, emoji: '🔥' },
]

// 连续登录奖励
const LOGIN_REWARDS = [
  { day: 1, coins: 50, exp: 10 },
  { day: 2, coins: 80, exp: 20 },
  { day: 3, coins: 120, exp: 30, card: 'common' },
  { day: 4, coins: 150, exp: 40 },
  { day: 5, coins: 200, exp: 50, card: 'uncommon' },
  { day: 6, coins: 300, exp: 60 },
  { day: 7, coins: 500, exp: 100, card: 'rare' },
]

// 特效类型
type EffectType = 'levelUp' | 'cardObtain' | 'achievement' | 'streak' | 'combo' | 'dailyReward' | 'loginReward'

// ==================== 引导组件 ====================

// 引导遮罩组件
const TutorialOverlay = ({ 
  step, 
  onNext, 
  onSkip,
  targetRef,
  t,
}: { 
  step: typeof TUTORIAL_STEPS[0]
  onNext: () => void
  onSkip: () => void
  targetRef?: React.RefObject<HTMLElement | null>
  t: (key: string) => string
}) => {
  const isCenter = step.position === 'center'
  
  // 获取目标元素位置
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  
  useEffect(() => {
    if (step.target && targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect()
      setTargetRect(rect)
    } else {
      setTargetRect(null)
    }
  }, [step.target, targetRef])
  
  // 计算提示框位置
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCenter) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
    
    if (targetRect) {
      if (step.position === 'top') {
        return {
          bottom: window.innerHeight - targetRect.top + 20,
          left: Math.max(20, Math.min(targetRect.left, window.innerWidth - 300)),
        }
      }
    }
    
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: isCenter ? 'center' : 'flex-start',
      justifyContent: isCenter ? 'center' : 'flex-start',
      pointerEvents: 'none', // 允许点击穿透
    }}>
      {/* 高亮目标区域 */}
      {targetRect && (
        <div style={{
          position: 'absolute',
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          borderRadius: '16px',
          border: '3px solid #667eea',
          boxShadow: '0 0 20px rgba(102, 126, 234, 0.6), 0 0 60px rgba(102, 126, 234, 0.3)',
          background: 'transparent',
          pointerEvents: 'none',
          animation: 'pulse 1.5s infinite',
        }} />
      )}
      
      {/* 提示框 */}
      <div style={{
        position: 'absolute',
        ...getTooltipStyle(),
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))',
        borderRadius: '20px',
        padding: '24px 28px',
        maxWidth: '320px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        animation: 'scaleIn 0.3s ease-out',
        pointerEvents: 'auto', // 提示框可点击
      }}>
        {/* 箭头指向目标 */}
        {targetRect && step.position === 'top' && (
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: 40,
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid rgba(118, 75, 162, 0.95)',
          }} />
        )}
        
        {/* 内容 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{step.emoji}</div>
          <div style={{ 
            color: 'white', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            {t(step.titleKey)}
          </div>
          <div style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '14px', 
            lineHeight: 1.6,
            marginBottom: '20px',
          }}>
            {t(step.contentKey)}
          </div>
          
          {/* 按钮 */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onSkip}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                pointerEvents: 'auto',
              }}
            >
              跳过引导
            </button>
            <button
              type="button"
              onClick={onNext}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#667eea',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                pointerEvents: 'auto',
              }}
            >
              下一步
            </button>
          </div>
        </div>
      </div>
      
      {/* 跳过按钮（右上角） */}
      <button
        type="button"
        onClick={onSkip}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          padding: '8px 16px',
          color: 'white',
          fontSize: '12px',
          cursor: 'pointer',
          pointerEvents: 'auto', // 按钮可点击
        }}
      >
        跳过引导
      </button>
    </div>
  )
}

// ==================== 增强特效组件 ====================

// 星星爆炸特效（升级用）
const StarBurstEffect = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!active || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string; rotation: number; shape: string;
    }> = []
    
    const colors = ['#fbbf24', '#f59e0b', '#fcd34d', '#fde047', '#fef08a']
    const shapes = ['star', 'circle', 'diamond']
    
    // 创建爆炸粒子
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50 + Math.random() * 0.5
      const speed = 3 + Math.random() * 8
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 12,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }
    
    let animationId: number
    let frame = 0
    
    const drawStar = (x: number, y: number, size: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const px = Math.cos(angle) * size
        const py = Math.sin(angle) * size
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15 // 重力
        p.alpha -= 0.015
        p.rotation += 0.1
        
        if (p.alpha > 0) {
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          
          if (p.shape === 'star') {
            drawStar(p.x, p.y, p.size, p.rotation)
          } else if (p.shape === 'diamond') {
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rotation)
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size)
            ctx.restore()
          } else {
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size/2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })
      
      ctx.globalAlpha = 1
      
      if (frame < 120 && particles.some(p => p.alpha > 0)) {
        animationId = requestAnimationFrame(animate)
      }
    }
    
    animate()
    return () => cancelAnimationFrame(animationId)
  }, [active])
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1002,
      }}
    />
  )
}

// 连胜火焰特效
const StreakFireEffect = ({ active, streak }: { active: boolean; streak: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!active || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; hue: number;
    }> = []
    
    let animationId: number
    let frame = 0
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      
      // 持续生成火焰粒子
      if (frame % 2 === 0) {
        for (let i = 0; i < 3; i++) {
          particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 100,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 5 - 3,
            size: 10 + Math.random() * 20,
            alpha: 0.8,
            hue: 20 + Math.random() * 30, // 橙色到黄色
          })
        }
      }
      
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.alpha -= 0.02
        p.size *= 0.98
        
        if (p.alpha > 0) {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
          gradient.addColorStop(0, `hsla(${p.hue}, 100%, 60%, ${p.alpha})`)
          gradient.addColorStop(0.5, `hsla(${p.hue - 10}, 100%, 50%, ${p.alpha * 0.5})`)
          gradient.addColorStop(1, `hsla(${p.hue - 20}, 100%, 30%, 0)`)
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      
      // 清理消失的粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].alpha <= 0) particles.splice(i, 1)
      }
      
      if (frame < 180) {
        animationId = requestAnimationFrame(animate)
      }
    }
    
    animate()
    return () => {
      cancelAnimationFrame(animationId)
      // 清除 canvas 内容
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [active, streak])
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1001,
      }}
    />
  )
}

// 彩带特效（成就/卡牌获得）
const ConfettiEffect = ({ active, colors }: { active: boolean; colors: string[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!active || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const confetti: Array<{
      x: number; y: number; vx: number; vy: number;
      width: number; height: number; color: string;
      rotation: number; rotationSpeed: number; alpha: number;
    }> = []
    
    // 创建彩带
    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        width: 8 + Math.random() * 8,
        height: 12 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1,
      })
    }
    
    let animationId: number
    let frame = 0
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      
      confetti.forEach(c => {
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.05 // 轻微重力
        c.rotation += c.rotationSpeed
        
        if (c.y < canvas.height + 50) {
          ctx.save()
          ctx.translate(c.x, c.y)
          ctx.rotate(c.rotation)
          ctx.globalAlpha = c.alpha
          ctx.fillStyle = c.color
          ctx.fillRect(-c.width/2, -c.height/2, c.width, c.height)
          ctx.restore()
        }
      })
      
      if (frame < 200) {
        animationId = requestAnimationFrame(animate)
      }
    }
    
    animate()
    return () => cancelAnimationFrame(animationId)
  }, [active, colors])
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1003,
      }}
    />
  )
}

// 粒子组件（增强版）
const ParticleEffect = ({ active, color }: { active: boolean; color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!active || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }> = []
    
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        size: Math.random() * 4 + 2,
        alpha: Math.random() * 0.5 + 0.5,
        color: color,
      })
    }
    
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.alpha -= 0.005
        
        if (p.alpha > 0) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
          ctx.fill()
        }
      })
      
      if (particles.some(p => p.alpha > 0)) {
        animationId = requestAnimationFrame(animate)
      }
    }
    
    animate()
    return () => cancelAnimationFrame(animationId)
  }, [active, color])
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  )
}

// 浮动文字组件
const FloatingTextComponent = ({ text }: { text: FloatingText }) => {
  const colors: Record<string, string> = {
    exp: '#4ade80',
    coin: '#fbbf24',
    card: '#a855f7',
    correct: '#22c55e',
    wrong: '#ef4444',
    streak: '#f59e0b',
    levelup: '#22d3ee',
  }
  
  const emojis: Record<string, string> = {
    exp: '⭐',
    coin: '💰',
    card: '🃏',
    correct: '✓',
    wrong: '✗',
    streak: '🔥',
    levelup: '🎉',
  }
  
  return (
    <div style={{
      position: 'fixed',
      left: text.x,
      top: text.y,
      transform: 'translateX(-50%)',
      color: colors[text.type],
      fontSize: text.type === 'card' ? '20px' : '18px',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      animation: 'floatUp 1.5s ease-out forwards',
      zIndex: 1001,
      pointerEvents: 'none',
    }}>
      {emojis[text.type]} {text.text}
    </div>
  )
}

// 成就检查函数
const checkAchievements = (state: GameState): string[] => {
  const newAchievements: string[] = []
  
  // 初次旅行：完成第一个场景
  if (state.stats.scenesCompleted >= 1 && !state.achievements.includes('first_trip')) {
    newAchievements.push('first_trip')
  }
  
  // 卡牌收藏家：收集10张卡牌
  if (state.cards.length >= 10 && !state.achievements.includes('card_collector')) {
    newAchievements.push('card_collector')
  }
  
  // 卡牌大师：收集30张卡牌
  if (state.cards.length >= 30 && !state.achievements.includes('card_master')) {
    newAchievements.push('card_master')
  }
  
  // 环球旅行家：解锁所有城市
  if (state.unlockedCities.length >= CITIES.length && !state.achievements.includes('world_traveler')) {
    newAchievements.push('world_traveler')
  }
  
  // 面试大师：完成所有面试场景
  const interviewScenes = DIALOG_SCENES.interview?.map(s => s.id) || []
  const completedInterviews = interviewScenes.filter(id => state.completedScenes.includes(id))
  if (completedInterviews.length >= interviewScenes.length && interviewScenes.length > 0 && !state.achievements.includes('interview_master')) {
    newAchievements.push('interview_master')
  }
  
  // 精准表达：正确率达到90%
  if (state.stats.totalAnswers >= 10 && 
      (state.stats.correctAnswers / state.stats.totalAnswers) >= 0.9 && 
      !state.achievements.includes('accuracy_90')) {
    newAchievements.push('accuracy_90')
  }
  
  // 经验丰富：完成20个场景
  if (state.stats.scenesCompleted >= 20 && !state.achievements.includes('scenes_20')) {
    newAchievements.push('scenes_20')
  }
  
  return newAchievements
}

// 本地存储键名
const STORAGE_KEY = 'english_game_state'

// 从本地存储加载状态
const loadGameState = (): GameState | null => {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load game state:', e)
  }
  return null
}

// 默认游戏状态
const DEFAULT_GAME_STATE: GameState = {
  level: 1,
  exp: 0,
  coins: 100,
  currentCity: 'newyork',
  unlockedCities: ['newyork'],
  completedScenes: [],
  cards: [],
  buildings: ['airport'],
  achievements: [],
  stats: { scenesCompleted: 0, correctAnswers: 0, totalAnswers: 0, cardsCollected: 0 },
  currentStreak: 0,
  maxStreak: 0,
  lastLoginDate: '',
  consecutiveLoginDays: 0,
  dailyTasks: {},
  lastTaskResetDate: '',
  tutorialStep: 0, // 引导步骤，-1 表示已完成
  answeredDialogIndices: [], // 已回答的对话索引
  wrongAnswers: [], // 错题本
}

// 获取今天的日期字符串
const getTodayString = () => new Date().toISOString().split('T')[0]

// 判断是否是白天（6:00 - 18:00）
const isDaytime = () => {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18
}

// 主题配置
const THEMES = {
  daytime: {
    // 背景
    bgGradient: 'linear-gradient(180deg, #e8f4f8 0%, #d1e8e0 50%, #c9dde4 100%)',
    // 文字颜色
    textPrimary: '#1a365d',
    textSecondary: '#4a5568',
    textMuted: '#718096',
    // 卡片/容器背景
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardBgHover: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(102, 126, 234, 0.2)',
    // 底部导航
    navBg: 'rgba(255, 255, 255, 0.95)',
    navBorder: 'rgba(102, 126, 234, 0.15)',
    // 头部
    headerBg: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
    headerBorder: 'rgba(102, 126, 234, 0.15)',
    // 强调色
    accent: '#667eea',
    accentLight: 'rgba(102, 126, 234, 0.15)',
    // 经验条
    expGradient: 'linear-gradient(90deg, #667eea, #764ba2)',
    // 按钮
    buttonPrimary: 'linear-gradient(135deg, #667eea, #764ba2)',
    buttonPrimaryText: 'white',
    // 阴影
    shadow: 'rgba(102, 126, 234, 0.15)',
  },
  nighttime: {
    // 背景
    bgGradient: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    // 文字颜色
    textPrimary: '#e0e0e0',
    textSecondary: '#a0a0a0',
    textMuted: '#888888',
    // 卡片/容器背景
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBgHover: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    // 底部导航
    navBg: 'rgba(26, 26, 46, 0.98)',
    navBorder: 'rgba(255, 255, 255, 0.1)',
    // 头部
    headerBg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    headerBorder: 'rgba(255, 255, 255, 0.1)',
    // 强调色
    accent: '#667eea',
    accentLight: 'rgba(102, 126, 234, 0.15)',
    // 经验条
    expGradient: 'linear-gradient(90deg, #667eea, #764ba2)',
    // 按钮
    buttonPrimary: 'linear-gradient(135deg, #667eea, #764ba2)',
    buttonPrimaryText: 'white',
    // 阴影
    shadow: 'rgba(0, 0, 0, 0.3)',
  }
}

// 主组件
export default function EnglishGame() {
  // 用户状态
  const [user, setUser] = useState<{ id: string; username: string; nickname: string; avatar: string } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // 主题状态（根据时间自动切换）
  const [isDarkMode, setIsDarkMode] = useState(!isDaytime())
  const theme = isDarkMode ? THEMES.nighttime : THEMES.daytime
  
  // 定时检查是否需要切换主题
  useEffect(() => {
    const checkTheme = () => {
      const shouldBeDark = !isDaytime()
      if (shouldBeDark !== isDarkMode) {
        setIsDarkMode(shouldBeDark)
      }
    }
    // 每分钟检查一次
    const interval = setInterval(checkTheme, 60000)
    return () => clearInterval(interval)
  }, [isDarkMode])
  
  // 清理音频资源
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])
  
  // 游戏状态
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // 语言状态
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  
  // 翻译字典
  const TRANSLATIONS: Record<string, Record<'zh' | 'en', string>> = {
    // 导航栏
    'nav.travel': { zh: '旅行', en: 'Travel' },
    'nav.cards': { zh: '卡牌', en: 'Cards' },
    'nav.city': { zh: '城镇', en: 'Town' },
    'nav.tasks': { zh: '任务', en: 'Tasks' },
    'nav.achievements': { zh: '成就', en: 'Awards' },
    'nav.rankings': { zh: '排行', en: 'Rank' },
    'nav.wrongAnswers': { zh: '错题', en: 'Wrong' },
    
    // 游戏界面
    'game.level': { zh: '等级', en: 'Level' },
    'game.exp': { zh: '经验', en: 'EXP' },
    'game.coins': { zh: '金币', en: 'Coins' },
    'game.cards': { zh: '张卡牌', en: 'Cards' },
    'game.player': { zh: '玩家', en: 'Player' },
    
    // 对话界面
    'dialog.progress': { zh: '对话进度', en: 'Progress' },
    'dialog.exit': { zh: '退出', en: 'Exit' },
    'dialog.yourAnswer': { zh: '你的回答：', en: 'Your Answer:' },
    'dialog.playPronunciation': { zh: '播放发音', en: 'Play' },
    'dialog.stop': { zh: '停止', en: 'Stop' },
    'dialog.continue': { zh: '继续', en: 'Continue' },
    'dialog.correct': { zh: '正确！', en: 'Correct!' },
    'dialog.wrong': { zh: '不对哦', en: 'Wrong' },
    'dialog.sceneComplete': { zh: '场景完成！', en: 'Complete!' },
    'dialog.nextQuestion': { zh: '下一题', en: 'Next' },
    'dialog.question': { zh: '问题', en: 'Question' },
    'dialog.allOptions': { zh: '所有选项', en: 'All Options' },
    'dialog.continueExplore': { zh: '继续探索', en: 'Continue' },
    'dialog.voiceTip': { zh: '点击语音按钮练习发音', en: 'Tap voice button to practice' },
    
    // 语音评分
    'voice.score': { zh: '发音评分', en: 'Score' },
    'voice.excellent': { zh: '优秀', en: 'Excellent' },
    'voice.good': { zh: '良好', en: 'Good' },
    'voice.pass': { zh: '及格', en: 'Pass' },
    'voice.needWork': { zh: '需努力', en: 'Try Again' },
    'voice.recognized': { zh: '识别结果', en: 'Recognized' },
    
    // 卡牌界面
    'cards.title': { zh: '卡牌收藏', en: 'Card Collection' },
    'cards.noCards': { zh: '还没有卡牌', en: 'No cards yet' },
    'cards.hint': { zh: '完成场景有机会获得卡牌', en: 'Complete scenes to earn cards' },
    'cards.progress': { zh: '收集进度', en: 'Collection Progress' },
    
    // 城镇界面
    'town.title': { zh: '我的英语小镇', en: 'My English Town' },
    'town.built': { zh: '已建造', en: 'Built' },
    'town.build': { zh: '建造', en: 'Build' },
    'town.stats': { zh: '学习统计', en: 'Learning Stats' },
    'town.scrollDown': { zh: '向下滑动查看游戏场景', en: 'Scroll down to see scenes' },
    'town.worldMap': { zh: '世界地图', en: 'World Map' },
    'town.scenesCompleted': { zh: '完成场景', en: 'Scenes Done' },
    'town.accuracy': { zh: '正确率', en: 'Accuracy' },
    'town.cardsCollected': { zh: '收集卡牌', en: 'Cards' },
    'town.buildingsBuilt': { zh: '建造建筑', en: 'Buildings' },
    
    // 消息提示
    'msg.buildSuccess': { zh: '建造成功！', en: 'Build Success!' },
    'msg.achievementUnlock': { zh: '成就解锁！', en: 'Achievement Unlocked!' },
    'msg.sceneCompleteTitle': { zh: '场景完成！', en: 'Scene Complete!' },
    'msg.sceneCompleteLog': { zh: '场景完成！', en: 'Scene complete!' },
    
    // 成就
    'achievement.firstTrip': { zh: '初次旅行', en: 'First Trip' },
    'achievement.cardCollector': { zh: '卡牌收藏家', en: 'Card Collector' },
    'achievement.cardMaster': { zh: '卡牌大师', en: 'Card Master' },
    'achievement.worldTraveler': { zh: '环球旅行家', en: 'World Traveler' },
    'achievement.interviewMaster': { zh: '面试大师', en: 'Interview Master' },
    'achievement.accuracy': { zh: '精准表达', en: 'Accuracy Master' },
    'achievement.experienced': { zh: '经验丰富', en: 'Experienced' },
    
    // 任务
    'tasks.title': { zh: '每日任务', en: 'Daily Tasks' },
    'tasks.completeScene': { zh: '完成1个场景', en: 'Complete 1 scene' },
    'tasks.correctAnswers': { zh: '正确回答5题', en: '5 correct answers' },
    'tasks.collectCard': { zh: '收集1张卡牌', en: 'Collect 1 card' },
    'tasks.streak': { zh: '连续答对5题', en: '5 streak' },
    
    // 错题本
    'wrongAnswers.title': { zh: '错题本', en: 'Wrong Answers' },
    'wrongAnswers.empty': { zh: '暂无错题', en: 'No wrong answers yet' },
    'wrongAnswers.hint': { zh: '答错时会自动记录', en: 'Wrong answers are saved automatically' },
    'wrongAnswers.question': { zh: '问题', en: 'Question' },
    'wrongAnswers.yourAnswer': { zh: '你的答案', en: 'Your Answer' },
    'wrongAnswers.correctAnswer': { zh: '正确答案', en: 'Correct Answer' },
    'wrongAnswers.reviewed': { zh: '已复习', en: 'Reviewed' },
    'wrongAnswers.mastered': { zh: '已掌握', en: 'Mastered' },
    'wrongAnswers.markMastered': { zh: '标记已掌握', en: 'Mark Mastered' },
    'wrongAnswers.delete': { zh: '删除', en: 'Delete' },
    'wrongAnswers.review': { zh: '复习', en: 'Review' },
    'wrongAnswers.total': { zh: '共', en: 'Total' },
    'wrongAnswers.items': { zh: '题', en: 'items' },
    'wrongAnswers.masteredCount': { zh: '已掌握', en: 'Mastered' },
    'wrongAnswers.sceneInfo': { zh: '场景', en: 'Scene' },
    
    // 其他
    'loading': { zh: '加载中...', en: 'Loading...' },
    'welcome': { zh: '欢迎来到英语冒险世界！', en: 'Welcome to English Adventure!' },
    'startGame': { zh: '开始游戏', en: 'Start Game' },
    
    // 城市名称
    'city.newyork': { zh: '纽约', en: 'New York' },
    'city.losangeles': { zh: '洛杉矶', en: 'Los Angeles' },
    'city.sanfrancisco': { zh: '旧金山', en: 'San Francisco' },
    'city.london': { zh: '伦敦', en: 'London' },
    'city.tokyo': { zh: '东京', en: 'Tokyo' },
    'city.paris': { zh: '巴黎', en: 'Paris' },
    'city.sydney': { zh: '悉尼', en: 'Sydney' },
    
    // 城市描述
    'city.newyork.desc': { zh: '美国最大城市，自由女神像所在地', en: 'Largest city in USA, home of the Statue of Liberty' },
    'city.losangeles.desc': { zh: '电影之都，好莱坞所在地', en: 'City of Stars, home of Hollywood' },
    'city.sanfrancisco.desc': { zh: '科技中心，金门大桥所在地', en: 'Tech hub, home of the Golden Gate Bridge' },
    'city.london.desc': { zh: '英国首都，大本钟所在地', en: 'Capital of UK, home of Big Ben' },
    'city.tokyo.desc': { zh: '日本首都，现代与传统交融', en: 'Capital of Japan, blend of modern and traditional' },
    'city.paris.desc': { zh: '浪漫之都，埃菲尔铁塔所在地', en: 'City of Love, home of the Eiffel Tower' },
    'city.sydney.desc': { zh: '澳大利亚最大城市，歌剧院所在地', en: 'Largest city in Australia, home of the Opera House' },
    
    // 场景类型
    'scene.airport': { zh: '机场', en: 'Airport' },
    'scene.hotel': { zh: '酒店', en: 'Hotel' },
    'scene.restaurant': { zh: '餐厅', en: 'Restaurant' },
    'scene.shopping': { zh: '购物', en: 'Shopping' },
    'scene.subway': { zh: '地铁', en: 'Subway' },
    'scene.beach': { zh: '海滩', en: 'Beach' },
    'scene.studio': { zh: '影城', en: 'Studio' },
    'scene.tech_company': { zh: '科技公司', en: 'Tech Company' },
    'scene.sightseeing': { zh: '观光', en: 'Sightseeing' },
    'scene.museum': { zh: '博物馆', en: 'Museum' },
    'scene.pub': { zh: '酒吧', en: 'Pub' },
    'scene.temple': { zh: '寺庙', en: 'Temple' },
    
    // 对话场景
    'dialog.airport_customs': { zh: '海关问答', en: 'Customs Q&A' },
    'dialog.airport_checkin': { zh: '值机托运', en: 'Check-in' },
    'dialog.airport_security': { zh: '安检过关', en: 'Security Check' },
    'dialog.hotel_checkin': { zh: '酒店入住', en: 'Hotel Check-in' },
    'dialog.hotel_service': { zh: '客房服务', en: 'Room Service' },
    'dialog.hotel_checkout': { zh: '退房结账', en: 'Check-out' },
    'dialog.restaurant_order': { zh: '餐厅点餐', en: 'Restaurant Order' },
    'dialog.restaurant_complaint': { zh: '餐厅投诉', en: 'Restaurant Complaint' },
    'dialog.shopping_clothes': { zh: '服装购物', en: 'Clothes Shopping' },
    'dialog.shopping_souvenir': { zh: '纪念品购物', en: 'Souvenir Shopping' },
    
    // 场景描述
    'dialog.airport_customs.desc': { zh: '通过海关检查', en: 'Pass through customs' },
    'dialog.airport_checkin.desc': { zh: '办理登机手续', en: 'Check in for your flight' },
    'dialog.airport_security.desc': { zh: '通过安全检查', en: 'Pass security check' },
    'dialog.hotel_checkin.desc': { zh: '办理酒店入住', en: 'Check in at hotel' },
    'dialog.hotel_service.desc': { zh: '使用客房服务', en: 'Use room service' },
    'dialog.hotel_checkout.desc': { zh: '办理退房手续', en: 'Check out from hotel' },
    'dialog.restaurant_order.desc': { zh: '在餐厅点餐', en: 'Order at restaurant' },
    'dialog.restaurant_complaint.desc': { zh: '处理餐厅投诉', en: 'Handle restaurant complaint' },
    'dialog.shopping_clothes.desc': { zh: '购买服装', en: 'Shop for clothes' },
    'dialog.shopping_souvenir.desc': { zh: '购买纪念品', en: 'Shop for souvenirs' },
    'dialog.interview_intro': { zh: '自我介绍', en: 'Self Introduction' },
    'dialog.interview_intro.desc': { zh: '面试开场自我介绍', en: 'Interview opening introduction' },
    'dialog.interview_tech': { zh: '技术面试', en: 'Tech Interview' },
    'dialog.interview_tech.desc': { zh: '技术岗位面试', en: 'Technical interview' },
    'dialog.interview_salary': { zh: '薪资谈判', en: 'Salary Negotiation' },
    'dialog.interview_salary.desc': { zh: '讨论薪资待遇', en: 'Discuss salary and benefits' },
    'dialog.interview_hr': { zh: 'HR面试', en: 'HR Interview' },
    'dialog.interview_hr.desc': { zh: '人事岗位面试', en: 'HR interview' },
    
    // NPC 名称
    'npc.customs_officer': { zh: '海关官员', en: 'Customs Officer' },
    'npc.tech_interviewer': { zh: '技术面试官', en: 'Tech Interviewer' },
    'npc.hr': { zh: 'HR', en: 'HR' },
    'npc.ground_staff': { zh: '地勤人员', en: 'Ground Staff' },
    'npc.security_officer': { zh: '安检员', en: 'Security Officer' },
    'npc.receptionist': { zh: '前台接待', en: 'Receptionist' },
    'npc.waiter': { zh: '服务员', en: 'Waiter' },
    'npc.shop_assistant': { zh: '店员', en: 'Shop Assistant' },
    'npc.interviewer': { zh: '面试官', en: 'Interviewer' },
    'npc.manager': { zh: '经理', en: 'Manager' },
    
    // 卡牌名称
    'card.greeting': { zh: '问候', en: 'Greeting' },
    'card.thanks': { zh: '感谢', en: 'Thanks' },
    'card.apology': { zh: '道歉', en: 'Apology' },
    'card.request': { zh: '请求', en: 'Request' },
    'card.documents': { zh: '递交证件', en: 'Submit Documents' },
    'card.payment': { zh: '付款', en: 'Payment' },
    'card.order_food': { zh: '点餐', en: 'Order Food' },
    'card.vacation': { zh: '度假说明', en: 'Vacation' },
    'card.duration': { zh: '时间表达', en: 'Duration' },
    'card.reservation': { zh: '预订确认', en: 'Reservation' },
    'card.window_seat': { zh: '靠窗座位', en: 'Window Seat' },
    'card.aisle_seat': { zh: '靠走道座位', en: 'Aisle Seat' },
    'card.ask_directions': { zh: '问路', en: 'Ask Directions' },
    'card.rental': { zh: '租借', en: 'Rental' },
    'card.drink': { zh: '点饮料', en: 'Order Drink' },
    'card.steak_order': { zh: '牛排点餐', en: 'Steak Order' },
    'card.complain': { zh: '投诉表达', en: 'Complaint' },
    'card.solution': { zh: '解决方案', en: 'Solution' },
    'card.shopping_intent': { zh: '购物意图', en: 'Shopping Intent' },
    'card.ask_price': { zh: '询问价格', en: 'Ask Price' },
    'card.try_on': { zh: '试穿请求', en: 'Try On' },
    'card.discount': { zh: '折扣询问', en: 'Discount' },
    'card.checkin': { zh: '入住登记', en: 'Check-in' },
    'card.room_service': { zh: '客房服务', en: 'Room Service' },
    'card.checkout': { zh: '退房', en: 'Checkout' },
    'card.wifi': { zh: 'WiFi请求', en: 'WiFi Request' },
    'card.interview_intro': { zh: '自我介绍', en: 'Self Intro' },
    'card.strength': { zh: '优势表达', en: 'Strength' },
    'card.weakness': { zh: '劣势回答', en: 'Weakness' },
    'card.salary': { zh: '薪资谈判', en: 'Salary' },
    'card.followup': { zh: '跟进问题', en: 'Follow-up' },
    
    // 卡牌分类
    'card.category.basic': { zh: '基础', en: 'Basic' },
    'card.category.travel': { zh: '旅行', en: 'Travel' },
    'card.category.dining': { zh: '餐饮', en: 'Dining' },
    'card.category.shopping': { zh: '购物', en: 'Shopping' },
    'card.category.interview': { zh: '面试', en: 'Interview' },
    
    // 卡牌稀有度
    'card.rarity.common': { zh: '普通', en: 'Common' },
    'card.rarity.uncommon': { zh: '稀有', en: 'Uncommon' },
    'card.rarity.rare': { zh: '精良', en: 'Rare' },
    'card.rarity.epic': { zh: '史诗', en: 'Epic' },
    'card.rarity.legendary': { zh: '传说', en: 'Legendary' },
    
    // 面试
    'interview.title': { zh: '面试特训', en: 'Interview Training' },
    'interview.desc': { zh: '模拟真实面试场景', en: 'Practice real interviews' },
    'interview.subtitle': { zh: '提升你的职场英语表达能力', en: 'Improve your workplace English' },
    'interview.completed': { zh: '已完成', en: 'Completed' },
    'interview.notCompleted': { zh: '未完成', en: 'Not Done' },
    
    // 任务
    'tasks.correctAnswers3': { zh: '正确回答3题', en: '3 correct answers' },
    'tasks.correctAnswers5': { zh: '正确回答5题', en: '5 correct answers' },
    'tasks.streak3': { zh: '连续答对3题', en: '3 streak' },
    'tasks.completed': { zh: '已完成', en: 'Done' },
    'tasks.claim': { zh: '领取', en: 'Claim' },
    'tasks.claimed': { zh: '已领取', en: 'Claimed' },
    
    // 排行榜
    'rankings.title': { zh: '排行榜', en: 'Rankings' },
    'rankings.level': { zh: '等级排行', en: 'By Level' },
    'rankings.loading': { zh: '加载中...', en: 'Loading...' },
    'rankings.noData': { zh: '暂无数据', en: 'No data yet' },
    'rankings.you': { zh: '你', en: 'You' },
    
    // 成就描述
    'achievement.firstTrip.desc': { zh: '完成第一个场景', en: 'Complete your first scene' },
    'achievement.cardCollector.desc': { zh: '收集10张卡牌', en: 'Collect 10 cards' },
    'achievement.cardMaster.desc': { zh: '收集30张卡牌', en: 'Collect 30 cards' },
    'achievement.worldTraveler.desc': { zh: '解锁所有城市', en: 'Unlock all cities' },
    'achievement.interviewMaster.desc': { zh: '完成所有面试场景', en: 'Complete all interviews' },
    'achievement.accuracy.desc': { zh: '正确率达到90%', en: 'Achieve 90% accuracy' },
    'achievement.experienced.desc': { zh: '完成20个场景', en: 'Complete 20 scenes' },
    
    // 通用
    'common.loading': { zh: '加载中...', en: 'Loading...' },
    'common.completed': { zh: '已完成', en: 'Completed' },
    'common.notCompleted': { zh: '未完成', en: 'Not Done' },
    'common.requireLevel': { zh: '需要等级', en: 'Requires Level' },
    'common.unlock': { zh: '解锁', en: 'Unlock' },
    'common.locked': { zh: '未解锁', en: 'Locked' },
    'common.new': { zh: '新', en: 'New' },
    'common.total': { zh: '总计', en: 'Total' },
    'common.day': { zh: '天', en: 'Day' },
    'common.days': { zh: '天', en: 'days' },
    'common.streak': { zh: '连击', en: 'Streak' },
    'common.error': { zh: '出错了', en: 'Error' },
    
    // 排行榜补充
    'rankings.cards': { zh: '卡牌排行', en: 'By Cards' },
    'rankings.accuracy': { zh: '正确率排行', en: 'By Accuracy' },
    'rankings.refresh': { zh: '刷新排行榜', en: 'Refresh Rankings' },
    
    // 连胜
    'streak.record': { zh: '连胜记录', en: 'Streak Record' },
    'streak.current': { zh: '当前连胜', en: 'Current Streak' },
    'streak.max': { zh: '最高连胜', en: 'Max Streak' },
    
    // 鼓励语
    'encourage.correct1': { zh: '太棒了！继续加油！🎉', en: 'Great! Keep it up! 🎉' },
    'encourage.correct2': { zh: '正确！你真厉害！✨', en: 'Correct! You\'re amazing! ✨' },
    'encourage.correct3': { zh: '完美！英语越来越好了！🌟', en: 'Perfect! Your English is improving! 🌟' },
    'encourage.correct4': { zh: '答对了！继续保持！💪', en: 'Right! Keep going! 💪' },
    'encourage.correct5': { zh: '精彩！你的英语进步神速！🚀', en: 'Brilliant! Fast progress! 🚀' },
    'encourage.correct6': { zh: 'Excellent! 你太强了！🔥', en: 'Excellent! You\'re on fire! 🔥' },
    'encourage.correct7': { zh: '正确！这就是学习的力量！📚', en: 'Correct! That\'s the power of learning! 📚' },
    'encourage.correct8': { zh: '太厉害了！无人能挡！⚡', en: 'Awesome! Unstoppable! ⚡' },
    'encourage.wrong1': { zh: '没关系，继续努力！💪', en: 'No worries, keep trying! 💪' },
    'encourage.wrong2': { zh: '加油，下次一定行！🌟', en: 'You\'ll get it next time! 🌟' },
    'encourage.wrong3': { zh: '别灰心，学习需要过程！📖', en: 'Don\'t give up, learning takes time! 📖' },
    'encourage.wrong4': { zh: '失败是成功之母！🌈', en: 'Failure is the mother of success! 🌈' },
    'encourage.wrong5': { zh: '再接再厉，你能行！🎯', en: 'Keep at it, you can do it! 🎯' },
    'encourage.streak3': { zh: '连续答对3题！🔥', en: '3 in a row! 🔥' },
    'encourage.streak5': { zh: '五连胜！太强了！⚡', en: '5 streak! Amazing! ⚡' },
    'encourage.streak7': { zh: '七连胜！势不可挡！🚀', en: '7 streak! Unstoppable! 🚀' },
    'encourage.streak10': { zh: '十连胜！你是英语天才！👑', en: '10 streak! You\'re a genius! 👑' },
    'encourage.levelUp1': { zh: '🎉 升级啦！', en: '🎉 Level Up!' },
    'encourage.levelUp2': { zh: '⭐ 等级提升！', en: '⭐ Level Increased!' },
    'encourage.levelUp3': { zh: '🚀 实力增强！', en: '🚀 Power Up!' },
    'encourage.levelUp4': { zh: '👑 又上一层楼！', en: '👑 Next Level!' },
    
    // 反馈文字
    'feedback.passport_needed': { zh: '海关需要查看护照哦', en: 'Customs needs to see your passport' },
    'feedback.not_polite': { zh: '这样不太礼貌', en: 'That\'s not very polite' },
    'feedback.tourist_visa': { zh: '旅游签证不能工作哦', en: 'Tourist visa doesn\'t allow work' },
    'feedback.not_formal': { zh: '回答不够正式', en: 'That\'s not formal enough' },
    'feedback.specify_duration': { zh: '需要明确停留时间', en: 'Need to specify duration' },
    'feedback.visa_limit': { zh: '旅游签证有期限限制', en: 'Tourist visa has time limit' },
    'feedback.answer_destination': { zh: '先回答目的地哦', en: 'Answer destination first' },
    'feedback.checkin_first': { zh: '先完成值机手续', en: 'Complete check-in first' },
    'feedback.no_passport': { zh: '没有护照无法乘机', en: 'Cannot fly without passport' },
    'feedback.need_documents': { zh: '值机需要这些证件', en: 'Check-in needs these documents' },
    'feedback.cooperate_security': { zh: '配合安检更快速', en: 'Cooperate for faster security' },
    'feedback.check_belongings': { zh: '检查一下随身物品', en: 'Check your belongings' },
    'feedback.standard_procedure': { zh: '这是标准程序', en: 'This is standard procedure' },
    'feedback.stay_still': { zh: '保持静止更快结束', en: 'Stay still to finish faster' },
    'feedback.show_boarding_pass': { zh: '先出示登机牌', en: 'Show boarding pass first' },
    'feedback.answer_count': { zh: '先回答人数', en: 'Answer the number of people first' },
    'feedback.complete_checkin': { zh: '先完成入住流程', en: 'Complete check-in first' },
    'feedback.try_solve': { zh: '先尝试解决问题', en: 'Try to solve first' },
    'feedback.accept_offer': { zh: '先接受合理offer', en: 'Accept the reasonable offer first' },
    'feedback.accept_compensation': { zh: '先接受补偿方案', en: 'Accept the compensation first' },
    'feedback.show_id': { zh: '先提供证件', en: 'Show your ID first' },
    'feedback.check_signs': { zh: '先看路牌确认位置', en: 'Check signs for your location' },
    'feedback.confirm_reservation': { zh: '先确认预订', en: 'Confirm reservation first' },
    'feedback.state_expectation': { zh: '先给出自己的期望更好', en: 'State your expectation first' },
    'feedback.be_specific': { zh: '先说明具体情况', en: 'Be specific about the situation' },
    'feedback.say_return': { zh: '先说明想退货', en: 'Say you want to return first' },
    'feedback.describe_problem': { zh: '先说明问题', en: 'Describe the problem first' },
    'feedback.specific_destination': { zh: '具体说明目的地更好', en: 'Be specific about destination' },
    'feedback.try_different': { zh: '可以先尝试换一份', en: 'Try a different one first' },
    'feedback.negotiate': { zh: '可以再争取一下', en: 'You can negotiate more' },
    'feedback.try_negotiate': { zh: '可以尝试协商', en: 'Try to negotiate' },
    'feedback.be_polite': { zh: '可以更礼貌一些', en: 'Be more polite' },
    'feedback.express_politely': { zh: '可以更礼貌地表达', en: 'Express more politely' },
    'feedback.ask_bill_politely': { zh: '可以更礼貌地要账单', en: 'Ask for bill more politely' },
    'feedback.ask_politely': { zh: '可以更礼貌地询问', en: 'Ask more politely' },
    'feedback.ask_discount': { zh: '可以询问折扣', en: 'Ask about discounts' },
    'feedback.ask_recommendation': { zh: '可以询问推荐', en: 'Ask for recommendations' },
    'feedback.ask_doneness': { zh: '可以询问推荐熟度', en: 'Ask about recommended doneness' },
    'feedback.ask_try_on': { zh: '可以询问是否可以试穿', en: 'Ask if you can try it on' },
    'feedback.sustainability': { zh: '可持续性很重要', en: 'Sustainability matters' },
    'feedback.us_tips': { zh: '在美国小费很重要', en: 'Tips are important in the US' },
    'feedback.subway_not_free': { zh: '地铁不是免费的', en: 'Subway is not free' },
    'feedback.subway_fastest': { zh: '地铁是最快的方式', en: 'Subway is the fastest way' },
    'feedback.persist': { zh: '坚持你的合理诉求', en: 'Persist with reasonable request' },
    'feedback.receipt_important': { zh: '小票对退货很重要', en: 'Receipt is important for returns' },
    'feedback.show_depth': { zh: '展示专业深度更好', en: 'Show professional depth' },
    'feedback.show_skills': { zh: '展示你的核心技能', en: 'Show your core skills' },
    'feedback.specific_project': { zh: '描述更具体的项目更好', en: 'Describe a specific project' },
    'feedback.everyone_has_strengths': { zh: '每个人都有优点', en: 'Everyone has strengths' },
    'feedback.nobody_perfect': { zh: '没人相信完美的人', en: 'No one believes in perfection' },
    'feedback.straight_left': { zh: '直走然后左转', en: 'Go straight then turn left' },
    'feedback.rental_fees': { zh: '租借需要付费', en: 'Rentals require payment' },
    'feedback.baggage_tag': { zh: '行李票很重要', en: 'Baggage tag is important' },
    'feedback.show_value': { zh: '要展示自己的价值', en: 'Show your value' },
    'feedback.rude_way': { zh: '说法不太礼貌', en: 'That\'s a rude way to say it' },
    'feedback.too_arrogant': { zh: '过于自大不太可取', en: 'Being too arrogant is not good' },
    'feedback.not_checked_in': { zh: '还没入住呢', en: 'Not checked in yet' },
    'feedback.what_to_see': { zh: '还没说要看什么', en: 'What do you want to see?' },
    'feedback.not_taken_off': { zh: '还没起飞呢', en: 'Plane hasn\'t taken off yet' },
    'feedback.wont_solve': { zh: '这不会解决问题', en: 'This won\'t solve the problem' },
    'feedback.not_luggage_service': { zh: '这不是行李服务', en: 'This isn\'t luggage service' },
    'feedback.not_good_answer': { zh: '这可不是好答案', en: 'That\'s not a good answer' },
    'feedback.fatal_weakness': { zh: '这可是致命弱点', en: 'That\'s a fatal weakness' },
    'feedback.room_type': { zh: '这可能是房型问题', en: 'This might be a room type issue' },
    'feedback.detailed_description': { zh: '需要更详细的描述', en: 'Need more detailed description' },
    'feedback.know_size': { zh: '需要知道自己的尺码', en: 'Need to know your size' },
    'feedback.interview_relevance': { zh: '面试自我介绍要突出职业相关', en: 'Highlight career relevance in intro' },
    'feedback.show_experience': { zh: '面试要展示经验', en: 'Show your experience in interviews' },
    'feedback.need_reason': { zh: '需要具体理由', en: 'Need a specific reason' },
    'feedback.specify_dish': { zh: '需要具体说明菜品', en: 'Specify what you want to order' },
    'feedback.need_receipt': { zh: '通常需要小票', en: 'Usually need a receipt' },
    'feedback.introduce_self': { zh: '主动介绍自己更好', en: 'Better to introduce yourself proactively' },
    'feedback.subway_need_pay': { zh: '需要付费才能乘地铁', en: 'Need to pay to ride the subway' },
    'feedback.buildLog': { zh: '建造了', en: 'Built' },
  }
  
  // 翻译函数
  const t = (key: string): string => {
    const translation = TRANSLATIONS[key]
    if (!translation) return key
    return translation[language]
  }
  
  // 切换语言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh')
  }
  
  // 特效状态
  const [showStarBurst, setShowStarBurst] = useState(false)
  const [showStreakFire, setShowStreakFire] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiColors, setConfettiColors] = useState<string[]>(['#667eea', '#764ba2'])
  
  // 鼓励弹窗
  const [showEncouragement, setShowEncouragement] = useState<{ text: string; emoji: string } | null>(null)
  
  // 每日奖励弹窗
  const [showDailyReward, setShowDailyReward] = useState<{ day: number; reward: typeof LOGIN_REWARDS[0] } | null>(null)
  
  const [activeTab, setActiveTab] = useState<Tab>('map')
  const [gameMode, setGameMode] = useState<GameMode>('menu')
  const [currentScene, setCurrentScene] = useState<DialogScene | null>(null)
  const [dialogIndex, setDialogIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showAnswerResult, setShowAnswerResult] = useState(false) // 答题后显示完整内容和翻译
  const [lastAnswerOption, setLastAnswerOption] = useState<DialogOption | null>(null) // 上一次回答的选项
  const [logs, setLogs] = useState<LogItem[]>([])
  const [notification, setNotification] = useState<{ title: string; text: string; emoji: string; show: boolean }>({ title: '', text: '', emoji: '', show: false })
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [showParticles, setShowParticles] = useState(false)
  const [particleColor, setParticleColor] = useState('#4ade80')
  const [showCardObtain, setShowCardObtain] = useState<GameCard | null>(null)
  
  // 排行榜数据
  const [rankings, setRankings] = useState<Array<{
    rank: number
    userId: string
    nickname: string
    avatar: string
    level: number
    exp: number
    coins: number
    scenesCompleted: number
    accuracy: number
    cardsCollected: number
    currentStreak: number
  }>>([])
  const [isLoadingRankings, setIsLoadingRankings] = useState(false)
  
  // 语音相关状态
  const [isPlayingTTS, setIsPlayingTTS] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceScore, setVoiceScore] = useState<{ score: number; feedback: string; recognizedText: string } | null>(null)
  const [showVoiceResult, setShowVoiceResult] = useState(false)
  const [currentPlayingText, setCurrentPlayingText] = useState<string | null>(null)
  const [currentPracticingOption, setCurrentPracticingOption] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  // 引导相关 ref
  const mapTabRef = useRef<HTMLButtonElement>(null)
  const cardsTabRef = useRef<HTMLButtonElement>(null)
  const tasksTabRef = useRef<HTMLButtonElement>(null)
  const achievementsTabRef = useRef<HTMLButtonElement>(null)
  const sceneAreaRef = useRef<HTMLDivElement>(null)
  
  // 引导前进
  const handleTutorialNext = useCallback(() => {
    const currentStep = gameState.tutorialStep
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setGameState(prev => ({ ...prev, tutorialStep: currentStep + 1 }))
    } else {
      // 完成引导
      setGameState(prev => ({ ...prev, tutorialStep: -1 }))
    }
  }, [gameState.tutorialStep])
  
  // 跳过引导
  const handleTutorialSkip = useCallback(() => {
    setGameState(prev => ({ ...prev, tutorialStep: -1 }))
  }, [])
  
  // 获取排行榜数据
  const fetchRankings = useCallback(async () => {
    setIsLoadingRankings(true)
    try {
      const response = await fetch('/api/game/rankings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('game_token')}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setRankings(data.rankings)
      }
    } catch (e) {
      console.error('Failed to fetch rankings:', e)
    } finally {
      setIsLoadingRankings(false)
    }
  }, [])
  
  // 获取当前引导步骤的目标 ref
  const getTutorialTargetRef = useCallback((stepId: string) => {
    switch (stepId) {
      case 'map': return mapTabRef
      case 'scene': return sceneAreaRef
      case 'cards': return cardsTabRef
      case 'tasks': return tasksTabRef
      case 'achievements': return achievementsTabRef
      default: return undefined
    }
  }, [])
  
  const idCounterRef = useRef(0)
  const getUniqueId = useCallback(() => {
    idCounterRef.current += 1
    return `id-${idCounterRef.current}-${Math.random().toString(36).slice(2, 8)}`
  }, [])

  // ==================== 语音功能 ====================
  
  // 播放语音（TTS）
  const playTTS = useCallback(async (text: string) => {
    if (isPlayingTTS && currentPlayingText === text) {
      // 如果正在播放同一段文本，则停止
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsPlayingTTS(false)
      setCurrentPlayingText(null)
      return
    }
    
    // 停止之前的播放
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    
    setIsPlayingTTS(true)
    setCurrentPlayingText(text)
    
    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      
      const data = await response.json()
      
      if (data.success && data.audioData) {
        // 创建音频元素并播放
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        )
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        
        audio.onended = () => {
          setIsPlayingTTS(false)
          setCurrentPlayingText(null)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onerror = () => {
          setIsPlayingTTS(false)
          setCurrentPlayingText(null)
        }
        
        await audio.play()
      } else {
        setIsPlayingTTS(false)
        setCurrentPlayingText(null)
        console.error('TTS failed:', data.error)
      }
    } catch (error) {
      console.error('TTS error:', error)
      setIsPlayingTTS(false)
      setCurrentPlayingText(null)
    }
  }, [isPlayingTTS, currentPlayingText])
  
  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('无法访问麦克风，请确保已授权麦克风权限')
    }
  }, [])
  
  // 停止录音并进行语音识别
  const stopRecordingAndRecognize = useCallback(async (targetText: string, optionIndex: number) => {
    if (!mediaRecorderRef.current) return
    
    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // 停止所有音轨
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        
        try {
          // 将音频转换为 base64
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1]
            
            // 调用 ASR API
            const response = await fetch('/api/voice/asr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                audioBase64: base64Data,
                targetText 
              }),
            })
            
            const data = await response.json()
            
            if (data.success) {
              setVoiceScore({
                score: data.score,
                feedback: data.feedback,
                recognizedText: data.recognizedText,
              })
              setCurrentPracticingOption(optionIndex)
              setShowVoiceResult(true)
            } else {
              console.error('ASR failed:', data.error)
              alert('语音识别失败，请重试')
            }
            resolve()
          }
          reader.readAsDataURL(audioBlob)
        } catch (error) {
          console.error('ASR error:', error)
          alert('语音识别出错，请重试')
          resolve()
        }
      }
      
      mediaRecorderRef.current!.stop()
    })
  }, [])

  // 检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 从 localStorage 获取用户 ID
        const storedUserId = typeof window !== 'undefined' 
          ? localStorage.getItem('game_user_id') 
          : null
        
        const headers: HeadersInit = {}
        if (storedUserId) {
          headers['x-user-id'] = storedUserId
        }
        
        const res = await fetch('/api/game/auth/me', { 
          credentials: 'include',
          headers
        })
        const data = await res.json()
        
        if (data.loggedIn && data.user) {
          setUser(data.user)
          // 从服务器加载游戏数据
          if (data.gameState) {
            // 安全解析 JSON 字段，处理可能是字符串或数组的情况
            const parseJsonField = <T,>(field: string | null | undefined, defaultValue: T): T => {
              if (!field) return defaultValue
              try {
                const parsed = JSON.parse(field)
                return parsed
              } catch {
                // 如果不是 JSON 字符串，返回默认值
                return defaultValue
              }
            }
            
            setGameState({
              level: data.gameState.level || 1,
              exp: data.gameState.exp || 0,
              coins: data.gameState.coins || 100,
              currentCity: data.gameState.currentCity || 'newyork',
              unlockedCities: parseJsonField(data.gameState.unlockedCities, ['newyork']),
              completedScenes: parseJsonField(data.gameState.completedScenes, []),
              cards: parseJsonField(data.gameState.cards, []),
              buildings: parseJsonField(data.gameState.buildings, ['airport']),
              achievements: parseJsonField(data.gameState.achievements, []),
              stats: JSON.parse(data.gameState.stats || '{"scenesCompleted":0,"correctAnswers":0,"totalAnswers":0,"cardsCollected":0}'),
              // 新增字段默认值
              currentStreak: data.gameState.currentStreak || 0,
              maxStreak: data.gameState.maxStreak || 0,
              lastLoginDate: data.gameState.lastLoginDate || '',
              consecutiveLoginDays: data.gameState.consecutiveLoginDays || 0,
              dailyTasks: data.gameState.dailyTasks ? JSON.parse(data.gameState.dailyTasks) : {},
              lastTaskResetDate: data.gameState.lastTaskResetDate || '',
              // 引导步骤
              tutorialStep: data.gameState.tutorialStep ?? 0,
              // 已回答的对话索引
              answeredDialogIndices: parseJsonField(data.gameState.answeredDialogIndices, []),
              // 错题本
              wrongAnswers: parseJsonField(data.gameState.wrongAnswers, []),
            })
          }
        } else {
          // 未登录，跳转到登录页
          window.location.href = '/login'
        }
      } catch (e) {
        console.error('Auth check failed:', e)
        window.location.href = '/login'
      } finally {
        setIsCheckingAuth(false)
        setIsLoaded(true)
      }
    }
    
    checkAuth()
  }, [])

  // 保存游戏状态到服务器
  const saveGameToServer = useCallback(async (state: GameState) => {
    if (!user) return
    
    // 从 localStorage 获取用户 ID
    const storedUserId = typeof window !== 'undefined' 
      ? localStorage.getItem('game_user_id') 
      : null
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (storedUserId) {
      headers['x-user-id'] = storedUserId
    }
    
    try {
      await fetch('/api/game/save', {
        method: 'POST',
        headers,
        body: JSON.stringify(state),
        credentials: 'include'
      })
    } catch (e) {
      console.error('Failed to save game:', e)
    }
  }, [user])

  // 游戏状态变化时自动保存（防抖）
  useEffect(() => {
    if (!isLoaded || !user) return
    
    const timer = setTimeout(() => {
      saveGameToServer(gameState)
    }, 2000) // 2秒后保存
    
    return () => clearTimeout(timer)
  }, [gameState, isLoaded, user, saveGameToServer])

  // 登出
  const handleLogout = async () => {
    try {
      // 清除 localStorage
      localStorage.removeItem('game_user_id')
      
      await fetch('/api/game/auth/logout', { method: 'POST', credentials: 'include' })
      window.location.href = '/login'
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

  // 添加浮动文字 - 移到早期返回之前
  const addFloatingText = useCallback((text: string, type: FloatingText['type'], x?: number, y?: number) => {
    const ft: FloatingText = {
      id: getUniqueId(),
      text,
      type,
      x: x || Math.random() * 200 + window.innerWidth / 2 - 100,
      y: y || 150,
    }
    setFloatingTexts(prev => [...prev, ft])
    setTimeout(() => setFloatingTexts(prev => prev.filter(f => f.id !== ft.id)), 1500)
  }, [getUniqueId])

  // 添加日志
  const addLog = useCallback((text: string, type: LogItem['type'] = 'normal') => {
    setLogs(prev => {
      const newLog: LogItem = {
        id: getUniqueId(),
        text,
        type,
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
      }
      return [newLog, ...prev].slice(0, 50)
    })
  }, [getUniqueId])

  // 显示通知
  const showNotify = useCallback((title: string, text: string, emoji: string = '🎉') => {
    setNotification({ title, text, emoji, show: true })
    setTimeout(() => setNotification(n => ({ ...n, show: false })), 2500)
  }, [])

  // 初始化日志
  useEffect(() => {
    if (logs.length === 0) {
      setLogs([{
        id: 'init-0',
        text: '欢迎来到英语冒险世界！',
        type: 'success',
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
      }])
    }
  }, [logs.length])

  // 计算升级所需经验
  const expToLevel = (level: number) => level * 100 + (level - 1) * 50
  const currentExpToLevel = expToLevel(gameState.level)
  const expProgress = (gameState.exp / currentExpToLevel) * 100

  // 加载中状态
  if (isCheckingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.bgGradient,
        color: theme.textPrimary,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <div>{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  // 未登录状态（正在跳转）
  if (!user) {
    return null
  }

  // 开始场景
  const startScene = (scene: DialogScene) => {
    setCurrentScene(scene)
    setDialogIndex(0)
    setSelectedOption(null)
    setShowFeedback(false)
    setGameMode('dialog')
    addLog(`${t('msg.startScene')}: ${scene.emoji} ${t(scene.titleKey)}`, 'normal')
  }

  // 选择选项
  const selectOption = (option: DialogOption, optionIndex: number, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top
    
    setSelectedOption(optionIndex)
    setShowFeedback(true)
    
    setGameState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalAnswers: prev.stats.totalAnswers + 1,
        correctAnswers: option.correct ? prev.stats.correctAnswers + 1 : prev.stats.correctAnswers,
      }
    }))

    if (option.correct) {
      // 检查是否已经回答过这道题
      const currentDialogIdx = dialogIndex
      const alreadyAnswered = gameState.answeredDialogIndices.includes(currentDialogIdx)
      
      // 只有首次回答正确才增加连胜
      const newStreak = alreadyAnswered ? gameState.currentStreak : gameState.currentStreak + 1
      
      // 显示鼓励语
      const encouragements = ENCOURAGEMENTS.correct
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
      
      addLog('✓ ' + t(randomEncouragement), 'success')
      addFloatingText(t('dialog.correct'), 'correct', x, y)
      
      // 连胜特效（只在连胜增加时显示）
      if (!alreadyAnswered && newStreak >= 3) {
        const streakText = ENCOURAGEMENTS.streak[newStreak as keyof typeof ENCOURAGEMENTS.streak]
        if (streakText) {
          setTimeout(() => {
            setShowEncouragement({ text: t(streakText), emoji: '🔥' })
            setShowStreakFire(true)
            setTimeout(() => {
              setShowStreakFire(false)
            }, 2500) // 比 canvas 动画时间稍长
            setTimeout(() => {
              setShowEncouragement(null)
            }, 3000)
          }, 300)
        }
      }
      
      // 更新连胜状态
      setGameState(prev => ({
        ...prev,
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        // 更新每日任务进度
        dailyTasks: {
          ...prev.dailyTasks,
          correct_answers: (prev.dailyTasks.correct_answers || 0) + 1,
          streak_5: newStreak >= 5 ? 5 : (prev.dailyTasks.streak_5 || 0),
        },
        // 记录已回答的题目
        answeredDialogIndices: alreadyAnswered 
          ? prev.answeredDialogIndices 
          : [...prev.answeredDialogIndices, currentDialogIdx]
      }))
      
      // 获得卡牌
      if (option.card) {
        const template = CARD_TEMPLATES.find(c => c.id === option.card)
        if (template && Math.random() < 0.35) {
          const newCard: GameCard = {
            ...template,
            uniqueId: getUniqueId(),
            level: 1,
          }
          setGameState(prev => ({
            ...prev,
            cards: [...prev.cards, newCard],
            stats: { ...prev.stats, cardsCollected: prev.stats.cardsCollected + 1 },
            dailyTasks: {
              ...prev.dailyTasks,
              collect_card: (prev.dailyTasks.collect_card || 0) + 1,
            }
          }))
          setTimeout(() => {
            setShowCardObtain(newCard)
            addFloatingText(t('msg.gotCard'), 'card')
            // 显示彩带特效
            setConfettiColors([RARITY_COLORS[newCard.rarity], '#fbbf24', '#4ade80'])
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 2500)
          }, 500)
        }
      }

      // 显示答题结果界面（不再自动进入下一题）
      setLastAnswerOption(option)
      setTimeout(() => {
        setShowAnswerResult(true)
      }, 800)
    } else {
      // 答错，重置连胜并记录错题
      const encouragements = ENCOURAGEMENTS.wrong
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
      
      addLog(`✗ ${t(randomEncouragement)}`, 'error')
      addFloatingText(option.feedbackKey ? t(option.feedbackKey) : (option.feedback || t('dialog.wrong')), 'wrong', x, y)
      
      // 记录错题
      const currentDialog = currentScene?.dialog[dialogIndex]
      const correctOption = currentDialog?.options?.find(o => o.correct)
      
      if (currentScene && currentDialog && correctOption) {
        const wrongAnswer: WrongAnswer = {
          id: getUniqueId(),
          sceneId: currentScene.id,
          sceneNameKey: currentScene.titleKey,
          cityId: gameState.currentCity,
          npcName: currentDialog.speakerName || (currentDialog.speakerNameKey ? t(currentDialog.speakerNameKey) : 'NPC'),
          question: currentDialog.text || '',
          questionTranslation: '', // 问题翻译可以后续添加
          correctOption: {
            text: correctOption.text,
            translation: correctOption.translation || '',
          },
          userOption: {
            text: option.text,
            translation: option.translation || '',
          },
          timestamp: Date.now(),
          reviewCount: 0,
          lastReviewTime: 0,
          mastered: false,
        }
        
        setGameState(prev => ({
          ...prev,
          currentStreak: 0, // 重置连胜
          wrongAnswers: [wrongAnswer, ...prev.wrongAnswers.slice(0, 99)], // 保留最近100条错题
        }))
      } else {
        setGameState(prev => ({
          ...prev,
          currentStreak: 0, // 重置连胜
        }))
      }
    }
  }

  // 完成场景
  const completeScene = () => {
    if (!currentScene) return
    
    const reward = currentScene.dialog.find(d => d.isEnd)?.reward || { exp: 30, coins: 50 }
    
    addFloatingText(`+${reward.exp} EXP`, 'exp', window.innerWidth / 2 - 50, 120)
    addFloatingText(`+${reward.coins}`, 'coin', window.innerWidth / 2 + 50, 140)
    
    setShowParticles(true)
    setParticleColor('#4ade80')
    setTimeout(() => setShowParticles(false), 2000)
    
    const prevLevel = gameState.level
    
    setGameState(prev => {
      const newExp = prev.exp + reward.exp
      const newCoins = prev.coins + reward.coins
      let newLevel = prev.level
      let remainingExp = newExp
      
      // 检查升级
      while (remainingExp >= expToLevel(newLevel)) {
        remainingExp -= expToLevel(newLevel)
        newLevel++
      }
      
      // 升级特效
      if (newLevel > prevLevel) {
        setTimeout(() => {
          const levelUpText = ENCOURAGEMENTS.levelUp[Math.floor(Math.random() * ENCOURAGEMENTS.levelUp.length)]
          setShowEncouragement({ text: `${t(levelUpText)} Lv.${newLevel}`, emoji: '⭐' })
          setShowStarBurst(true)
          setTimeout(() => {
            setShowStarBurst(false)
            setShowEncouragement(null)
          }, 3000)
        }, 500)
      }
      
      // 解锁城市
      const newUnlockedCities = [...prev.unlockedCities]
      CITIES.forEach(city => {
        if (!newUnlockedCities.includes(city.id) && newLevel >= (city.requireLevel || 0)) {
          newUnlockedCities.push(city.id)
          showNotify(t('common.unlock'), `${city.emoji} ${t(city.nameKey)}`, '🗺️')
          setShowParticles(true)
          setParticleColor(city.color)
          setTimeout(() => setShowParticles(false), 2000)
        }
      })
      
      // 构建新状态
      const newState: GameState = {
        ...prev,
        level: newLevel,
        exp: remainingExp,
        coins: newCoins,
        completedScenes: [...prev.completedScenes, currentScene.id],
        unlockedCities: newUnlockedCities,
        stats: { ...prev.stats, scenesCompleted: prev.stats.scenesCompleted + 1 },
        // 更新每日任务
        dailyTasks: {
          ...prev.dailyTasks,
          complete_scene: (prev.dailyTasks.complete_scene || 0) + 1,
        }
      }
      
      // 检查成就
      const newAchievements = checkAchievements(newState)
      if (newAchievements.length > 0) {
        newState.achievements = [...prev.achievements, ...newAchievements]
        const achievement = ACHIEVEMENTS.find(a => a.id === newAchievements[0])
        if (achievement) {
          newState.coins += achievement.reward
          setTimeout(() => {
            showNotify(t('msg.achievementUnlock'), `${achievement.emoji} ${t(achievement.nameKey)}`, '🏆')
            // 成就彩带特效
            setConfettiColors(['#fbbf24', '#f59e0b', '#fcd34d'])
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 2500)
          }, 500)
        }
      }
      
      return newState
    })
    
    addLog(`${t('msg.sceneCompleteLog')} +${reward.exp} EXP +${reward.coins} 💰`, 'success')
    showNotify(t('msg.sceneCompleteTitle'), `+${reward.exp} EXP, +${reward.coins} 💰`, '🎉')
    setGameMode('result')
  }

  // 返回菜单
  const backToMenu = () => {
    setGameMode('menu')
    setCurrentScene(null)
    setDialogIndex(0)
  }

  // 渲染等级进度条
  const renderLevelBar = () => (
    <div style={{
      position: 'sticky',
      top: 0,
      background: theme.headerBg,
      padding: '12px 16px',
      borderBottom: `1px solid ${theme.headerBorder}`,
      zIndex: 100,
      transition: 'background 0.5s ease',
    }}>
      {/* 用户信息行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: theme.buttonPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: `0 4px 12px ${theme.shadow}`,
          }}>
            {user?.avatar || '🎮'}
          </div>
          <div>
            <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: 'bold' }}>
              {user?.nickname || user?.username || t('game.player')}
            </div>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>Level {gameState.level}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* 语言切换按钮 */}
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              background: language === 'en' ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.accentLight,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: language === 'en' ? 'white' : theme.textPrimary,
              transition: 'all 0.2s ease',
            }}
            title={language === 'zh' ? t('language.switchToEn') : t('language.switchToZh')}
          >
            {language === 'zh' ? 'EN' : '中'}
          </button>
          {/* 主题切换按钮 */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              background: theme.accentLight,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title={isDarkMode ? t('theme.switchToLight') : t('theme.switchToDark')}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
          <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold' }}>💰 {formatNumber(gameState.coins)}</div>
          <div style={{ color: '#a855f7', fontSize: '14px', fontWeight: 'bold' }}>🃏 {gameState.cards.length}</div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: theme.accentLight,
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              color: theme.textMuted,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {t('dialog.exit')}
          </button>
        </div>
      </div>
      {/* 经验条 */}
      <div style={{ height: '6px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          width: `${expProgress}%`,
          height: '100%',
          background: theme.expGradient,
          transition: 'width 0.5s ease',
          borderRadius: '3px',
        }} />
      </div>
    </div>
  )

  // 渲染底部导航
  const renderBottomNav = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: theme.navBg,
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '6px 0 8px',
      borderTop: `1px solid ${theme.navBorder}`,
      zIndex: 100,
      transition: 'background 0.5s ease',
    }}>
      {[
        { id: 'map', emoji: '🗺️', nameKey: 'nav.travel', ref: mapTabRef },
        { id: 'cards', emoji: '🃏', nameKey: 'nav.cards', ref: cardsTabRef },
        { id: 'city', emoji: '🏘️', nameKey: 'nav.city', ref: null },
        { id: 'tasks', emoji: '📅', nameKey: 'nav.tasks', ref: tasksTabRef },
        { id: 'achievements', emoji: '🏆', nameKey: 'nav.achievements', ref: achievementsTabRef },
        { id: 'rankings', emoji: '📊', nameKey: 'nav.rankings', ref: null },
        { id: 'wrongAnswers', emoji: '📝', nameKey: 'nav.wrongAnswers', ref: null },
      ].map(tab => (
        <button
          key={tab.id}
          ref={tab.ref as React.RefObject<HTMLButtonElement>}
          type="button"
          onClick={() => { setActiveTab(tab.id as Tab); setGameMode('menu') }}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          style={{
            background: activeTab === tab.id ? theme.accentLight : 'none',
            border: 'none',
            color: activeTab === tab.id ? theme.accent : theme.textMuted,
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <span style={{ fontSize: '22px' }}>{tab.emoji}</span>
          <span>{t(tab.nameKey)}</span>
        </button>
      ))}
    </div>
  )

  // 渲染地图视图
  const renderMapView = () => (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* 滚动提示 */}
      <div style={{
        background: theme.accentLight,
        border: `1px solid ${theme.accent}`,
        borderRadius: '12px',
        padding: '10px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        animation: 'pulse 2s infinite',
      }}>
        <span style={{ fontSize: '16px' }}>👇</span>
        <span style={{ color: theme.accent, fontSize: '13px', fontWeight: 'bold' }}>{t('town.scrollDown')}</span>
        <span style={{ fontSize: '16px' }}>👇</span>
      </div>
      
      <h2 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🗺️ {t('town.worldMap')}
      </h2>
      
      {CITIES.map(city => {
        const isUnlocked = gameState.unlockedCities.includes(city.id)
        const isSelected = gameState.currentCity === city.id
        return (
          <div
            key={city.id}
            role="button"
            tabIndex={0}
            onClick={() => isUnlocked && setGameState(prev => ({ ...prev, currentCity: city.id }))}
            onTouchStart={(e) => isUnlocked && (e.currentTarget.style.transform = 'scale(0.98)')}
            onTouchEnd={(e) => e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)'}
            onKeyDown={(e) => e.key === 'Enter' && isUnlocked && setGameState(prev => ({ ...prev, currentCity: city.id }))}
            style={{
              background: isSelected 
                ? `linear-gradient(135deg, ${city.color}22, ${city.color}11)`
                : theme.cardBg,
              border: `2px solid ${isSelected ? city.color : theme.cardBorder}`,
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '10px',
              opacity: isUnlocked ? 1 : 0.5,
              cursor: isUnlocked ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${city.color}, ${city.color}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                boxShadow: `0 4px 12px ${city.color}33`,
              }}>
                {isUnlocked ? city.emoji : '🔒'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>{t(city.nameKey)}</div>
                <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t(city.descKey)}</div>
                {!isUnlocked && <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '2px' }}>{t('common.requireLevel')} {city.requireLevel}</div>}
              </div>
              {isUnlocked && isSelected && (
                <div style={{ 
                  color: city.color, 
                  fontSize: '20px',
                  animation: 'pulse 1.5s infinite',
                }}>▶</div>
              )}
            </div>
          </div>
        )
      })}
      
      {/* 当前城市场景 */}
      {gameMode === 'menu' && (
        <div ref={sceneAreaRef} style={{ marginTop: '20px' }}>
          <h3 style={{ color: theme.textPrimary, marginBottom: '12px', fontSize: '16px' }}>
            📍 {t(CITIES.find(c => c.id === gameState.currentCity)?.nameKey || '')} - {t('scene.title')}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {CITIES.find(c => c.id === gameState.currentCity)?.scenes.map(sceneId => {
              const scenes = DIALOG_SCENES[sceneId] || []
              return scenes.map(scene => {
                const isCompleted = gameState.completedScenes.includes(scene.id)
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => startScene(scene)}
                    style={{
                      background: isCompleted ? 'rgba(74, 222, 128, 0.08)' : theme.cardBg,
                      border: `1px solid ${isCompleted ? '#4ade8044' : theme.cardBorder}`,
                      borderRadius: '14px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'left' as const,
                      transition: 'all 0.2s ease',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{scene.emoji}</div>
                    <div style={{ color: theme.textPrimary, fontSize: '13px', fontWeight: 'bold' }}>{t(scene.titleKey)}</div>
                    {scene.descKey && (
                      <div style={{ color: theme.textMuted, fontSize: '10px', marginTop: '2px' }}>{t(scene.descKey)}</div>
                    )}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                      <span style={{
                        background: scene.difficulty === 1 ? '#22c55e' : scene.difficulty === 2 ? '#f59e0b' : '#ef4444',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                        {'★'.repeat(scene.difficulty)}
                      </span>
                      {isCompleted && <span style={{ color: '#4ade80', fontSize: '12px' }}>✓</span>}
                    </div>
                  </button>
                )
              })
            })}
          </div>
        </div>
      )}
    </div>
  )

  // 获取场景类型（用于获取背景配置）
  const getSceneType = (sceneId: string): string => {
    // 从场景ID中提取类型，如 'airport_customs' -> 'airport'
    const parts = sceneId.split('_')
    return parts[0] || 'airport'
  }

  // 获取场景背景配置
  const getSceneBackground = (sceneId: string) => {
    const sceneType = getSceneType(sceneId)
    return SCENE_TYPES[sceneType]?.background || SCENE_TYPES.airport.background
  }

  // 渲染对话视图
  const renderDialogView = () => {
    if (!currentScene) return null
    
    const currentLine = currentScene.dialog[dialogIndex]
    const sceneBackground = getSceneBackground(currentScene.id)
    
    // 安全检查
    if (!currentLine) {
      return (
        <div style={{ 
          padding: '16px', 
          paddingBottom: '80px', 
          minHeight: '100vh', 
          textAlign: 'center',
          background: sceneBackground.gradient,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😅</div>
          <div style={{ color: '#fff', marginBottom: '20px' }}>{t('common.error')}</div>
          <button
            type="button"
            onClick={backToMenu}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {t('common.back')}
          </button>
        </div>
      )
    }
    
    const isPlayerTurn = currentLine.speaker === 'player'
    
    // 答题结果显示界面
    if (showAnswerResult && lastAnswerOption) {
      // 找到下一个 NPC 对话的索引（不依赖 next 字段）
      let nextNpcIndex = dialogIndex + 1
      while (nextNpcIndex < currentScene.dialog.length && currentScene.dialog[nextNpcIndex].speaker === 'player') {
        nextNpcIndex++
      }
      
      // 找到上一个 NPC 对话（问题）
      let prevNpcIndex = dialogIndex - 1
      while (prevNpcIndex >= 0 && currentScene.dialog[prevNpcIndex].speaker !== 'npc') {
        prevNpcIndex--
      }
      const questionLine = prevNpcIndex >= 0 ? currentScene.dialog[prevNpcIndex] : null
      
      // 获取当前玩家选项（所有选项）
      const currentPlayerLine = currentScene.dialog[dialogIndex]
      const allOptions = currentPlayerLine?.options || []
      
      const hasNextDialog = nextNpcIndex < currentScene.dialog.length
      const isEnd = hasNextDialog && currentScene.dialog[nextNpcIndex]?.isEnd
      
      return (
        <div style={{ 
          minHeight: '100vh', 
          position: 'relative',
          background: sceneBackground.gradient,
          overflow: 'hidden',
        }}>
          {/* 背景图案层 */}
          {sceneBackground.pattern && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: sceneBackground.pattern,
              pointerEvents: 'none',
            }} />
          )}
          
          {/* 内容层 */}
          <div style={{ 
            position: 'relative', 
            zIndex: 1,
            padding: '12px', 
            paddingBottom: '80px',
          }}>
            {/* 场景标题 - 紧凑版 */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}>
              <span style={{ fontSize: '22px' }}>{currentScene.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#1a365d', fontWeight: 'bold', fontSize: '13px' }}>{t(currentScene.titleKey)}</div>
                <div style={{ color: '#718096', fontSize: '10px' }}>{t('dialog.progress')}: {dialogIndex + 1}/{currentScene.dialog.length}</div>
              </div>
              <div style={{
                background: 'rgba(74, 222, 128, 0.15)',
                color: '#22c55e',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}>
                ✅ {t('dialog.correct')}
              </div>
            </div>
          
          {/* 答题结果卡片 - 紧凑版 */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}>
            {/* 问题区域 - 紧凑版 */}
            {questionLine && (
              <div style={{
                background: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '10px',
                borderLeft: '3px solid #667eea',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginBottom: '6px' 
                }}>
                  <span style={{ fontSize: '16px' }}>{questionLine.speakerEmoji || '💬'}</span>
                  <span style={{ color: '#667eea', fontSize: '11px', fontWeight: 'bold' }}>
                    {questionLine.speakerNameKey ? t(questionLine.speakerNameKey) : 'NPC'}
                  </span>
                  <span style={{ 
                    background: '#667eea',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '6px',
                    fontSize: '10px',
                  }}>
                    {t('dialog.question')}
                  </span>
                  {/* 播放问题发音 */}
                  <button
                    type="button"
                    onClick={() => questionLine.text && playTTS(questionLine.text)}
                    disabled={isPlayingTTS && currentPlayingText !== questionLine.text}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: isPlayingTTS && currentPlayingText === questionLine.text
                        ? '#ef4444'
                        : '#667eea',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '3px 8px',
                      color: 'white',
                      fontSize: '10px',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    🔊
                  </button>
                </div>
                <div style={{ 
                  color: '#1a365d', 
                  fontSize: '13px', 
                  lineHeight: 1.5,
                }}>
                  {questionLine.text}
                </div>
              </div>
            )}
            
            {/* 所有选项区域 - 紧凑版 */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.03)',
              borderRadius: '10px',
              padding: '10px',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                marginBottom: '8px' 
              }}>
                <span style={{ fontSize: '14px' }}>📝</span>
                <span style={{ color: '#1a365d', fontSize: '12px', fontWeight: 'bold' }}>
                  {t('dialog.allOptions')}
                </span>
              </div>
              
              {allOptions.map((option, idx) => (
                <div key={idx} style={{
                  background: option.correct 
                    ? 'rgba(74, 222, 128, 0.12)' 
                    : 'rgba(239, 68, 68, 0.05)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  marginBottom: '6px',
                  border: option.correct ? '2px solid #4ade80' : '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}>
                  {/* 选项标记 */}
                  <div style={{
                    background: option.correct ? '#22c55e' : '#ef4444',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {option.correct ? '✓' : '✗'}
                  </div>
                  
                  {/* 内容区域 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* 英文句子 */}
                    <div style={{ 
                      color: '#1a365d', 
                      fontSize: '13px', 
                      lineHeight: 1.4,
                      fontWeight: '500',
                    }}>
                      {option.text}
                    </div>
                    
                    {/* 中文翻译 */}
                    {option.translation && (
                      <div style={{ 
                        color: '#718096', 
                        fontSize: '11px', 
                        lineHeight: 1.4,
                        marginTop: '2px',
                      }}>
                        {option.translation}
                      </div>
                    )}
                  </div>
                  
                  {/* 播放按钮 */}
                  <button
                    type="button"
                    onClick={() => playTTS(option.text)}
                    disabled={isPlayingTTS && currentPlayingText !== option.text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      background: isPlayingTTS && currentPlayingText === option.text
                        ? '#ef4444'
                        : option.correct 
                          ? '#22c55e'
                          : '#667eea',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* 操作按钮 - 紧凑版 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            {hasNextDialog ? (
              <button
                type="button"
                onClick={() => {
                  setShowAnswerResult(false)
                  setLastAnswerOption(null)
                  setSelectedOption(null)
                  setShowFeedback(false)
                  setDialogIndex(nextNpcIndex)
                  if (isEnd) {
                    completeScene()
                  }
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)',
                }}
              >
                {isEnd ? `🎉 ${t('dialog.sceneComplete')}` : `➡️ ${t('dialog.nextQuestion')}`}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowAnswerResult(false)
                  setLastAnswerOption(null)
                  completeScene()
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
                }}
              >
                🎉 {t('dialog.sceneComplete')}
              </button>
            )}
            
            <button
              type="button"
              onClick={() => {
                setShowAnswerResult(false)
                setLastAnswerOption(null)
                backToMenu()
              }}
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#718096',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              🏠
            </button>
          </div>
        </div>
      </div>
      )
    }
    
    return (
      <div style={{ 
        minHeight: '100vh', 
        position: 'relative',
        background: sceneBackground.gradient,
        overflow: 'hidden',
      }}>
        {/* 背景图案层 */}
        {sceneBackground.pattern && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: sceneBackground.pattern,
            pointerEvents: 'none',
          }} />
        )}
        
        {/* 环境光效果 */}
        {sceneBackground.ambientColor && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: `radial-gradient(ellipse at 50% 0%, ${sceneBackground.ambientColor} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
        )}
        
        {/* 内容层 */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1,
          padding: '16px', 
          paddingBottom: '80px',
        }}>
          {/* 场景标题 */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '14px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            <span style={{ fontSize: '28px' }}>{currentScene.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#1a365d', fontWeight: 'bold' }}>{t(currentScene.titleKey)}</div>
              <div style={{ color: '#718096', fontSize: '11px' }}>{t('dialog.progress')}: {dialogIndex + 1}/{currentScene.dialog.length}</div>
            </div>
            <button
              type="button"
              onClick={backToMenu}
              style={{
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                color: '#718096',
                cursor: 'pointer',
                fontSize: '12px',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                transition: 'all 0.2s ease',
              }}
            >
              ✕ {t('dialog.exit')}
            </button>
          </div>
        
          {/* NPC 对话内容 */}
          {!isPlayerTurn && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginBottom: '20px',
              animation: 'fadeIn 0.3s ease',
            }}>
              {/* NPC 角色 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '8px',
              }}>
                {/* NPC 头像 */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  border: '3px solid rgba(255,255,255,0.9)',
                }}>
                  {currentLine.speakerEmoji}
                </div>
                {/* NPC 名字 */}
                <div style={{
                  background: 'rgba(255,255,255,0.9)',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  color: '#667eea',
                  fontSize: '13px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}>
                  {currentLine.speakerNameKey ? t(currentLine.speakerNameKey) : currentLine.speakerName}
                </div>
              </div>
              
              {/* NPC 对话气泡 */}
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '0 18px 18px 18px',
                padding: '16px 20px',
                maxWidth: '85%',
                marginLeft: '72px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
                <div style={{ 
                  color: '#1a365d', 
                  fontSize: '17px', 
                  lineHeight: 1.7,
                  fontWeight: '500',
                }}>
                  {currentLine.text}
                </div>
              </div>
              
              {/* 按钮组：语音播放 + 继续对话 */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '12px',
                marginLeft: '72px',
              }}>
                {/* 语音播放按钮 */}
                <button
                  type="button"
                  onClick={() => currentLine.text && playTTS(currentLine.text)}
                  disabled={isPlayingTTS && currentPlayingText !== currentLine.text}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isPlayingTTS && currentPlayingText === currentLine.text 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 18px',
                    color: 'white',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isPlayingTTS && currentPlayingText !== currentLine.text ? 0.5 : 1,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  {isPlayingTTS && currentPlayingText === currentLine.text ? (
                    <>
                      <span style={{ animation: 'pulse 1s infinite' }}>⏹</span>
                      <span>{t('dialog.stop')}</span>
                    </>
                  ) : (
                    <>
                      <span>🔊</span>
                      <span>{t('dialog.playPronunciation')}</span>
                    </>
                  )}
                </button>
                
                {/* 继续对话按钮 */}
                <button
                  type="button"
                  onClick={() => {
                    // 进入下一轮对话
                    const nextIndex = dialogIndex + 1
                    if (currentScene && nextIndex < currentScene.dialog.length) {
                      setDialogIndex(nextIndex)
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 18px',
                    color: 'white',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <span>{t('dialog.continue')}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
          
          {/* 玩家选项 */}
          {isPlayerTurn && currentLine.options && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              marginBottom: '20px',
              animation: 'fadeIn 0.3s ease',
            }}>
              {/* 玩家角色提示 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '12px',
                justifyContent: 'flex-end',
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.9)',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  color: '#22c55e',
                  fontSize: '13px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}>
                  🧑 {t('game.player')}
                </div>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                  border: '3px solid rgba(255,255,255,0.9)',
                }}>
                  🧑
                </div>
              </div>
              
              {/* 选项提示 */}
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '8px 16px',
                borderRadius: '12px',
                marginBottom: '12px',
                color: '#718096',
                fontSize: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}>
                💡 {t('dialog.voiceTip')}
              </div>
              
              {/* 选项列表 */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                width: '100%',
              }}>
                {currentLine.options.map((option, idx) => {
                  const isSelected = selectedOption === idx
                  const showResult = showFeedback && isSelected
                  const isCurrentRecording = isRecording && currentPracticingOption === idx
                  
                  return (
                    <div key={idx} style={{ 
                      position: 'relative',
                      animation: `slideDown 0.3s ease ${idx * 0.1}s both`,
                    }}>
                      <button
                        type="button"
                        onClick={(e) => !showFeedback && selectOption(option, idx, e)}
                        disabled={showFeedback}
                        style={{
                          width: '100%',
                          background: showResult 
                            ? (option.correct ? 'rgba(74, 222, 128, 0.95)' : 'rgba(239, 68, 68, 0.95)')
                            : 'rgba(255,255,255,0.95)',
                          border: showResult
                            ? `2px solid ${option.correct ? '#22c55e' : '#ef4444'}`
                            : '2px solid rgba(255,255,255,0.5)',
                          borderRadius: '16px',
                          padding: '16px 100px 16px 20px',
                          textAlign: 'left' as const,
                          cursor: showFeedback ? 'default' : 'pointer',
                          transition: 'all 0.2s ease',
                          transform: isSelected && !showFeedback ? 'scale(1.02)' : 'scale(1)',
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation',
                          boxShadow: showResult 
                            ? (option.correct ? '0 4px 20px rgba(74, 222, 128, 0.4)' : '0 4px 20px rgba(239, 68, 68, 0.4)')
                            : '0 4px 20px rgba(0,0,0,0.15)',
                        }}
                      >
                        <div style={{ 
                          color: showResult 
                            ? (option.correct ? '#fff' : '#fff')
                            : '#1a365d', 
                          fontSize: '15px', 
                          lineHeight: 1.5,
                          fontWeight: '500',
                        }}>
                          {option.text}
                        </div>
                        {showResult && (
                          <div style={{ 
                            marginTop: '8px', 
                            fontSize: '12px',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            {option.correct ? `✓ ${t('dialog.correct')}` : `✗ ${option.feedbackKey ? t(option.feedbackKey) : (option.feedback || t('dialog.wrong'))}`}
                          </div>
                        )}
                      </button>
                      
                      {/* 语音练习按钮组 */}
                      <div style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        gap: '6px',
                        zIndex: 10,
                      }}>
                        {/* 播放按钮 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            playTTS(option.text)
                          }}
                          disabled={isPlayingTTS && currentPlayingText !== option.text}
                          title="播放发音"
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            border: 'none',
                            background: isPlayingTTS && currentPlayingText === option.text
                              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                              : 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isPlayingTTS && currentPlayingText !== option.text ? 0.5 : 1,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        >
                          {isPlayingTTS && currentPlayingText === option.text ? '⏹' : '🔊'}
                        </button>
                        
                        {/* 语音录制按钮 */}
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (isCurrentRecording) {
                              setCurrentPracticingOption(idx)
                              await stopRecordingAndRecognize(option.text, idx)
                            } else {
                              setCurrentPracticingOption(idx)
                              setVoiceScore(null)
                              setShowVoiceResult(false)
                              await startRecording()
                              setTimeout(() => {
                                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                                  stopRecordingAndRecognize(option.text, idx)
                                }
                              }, 5000)
                            }
                          }}
                          title={isCurrentRecording ? '停止录音' : '开始语音练习'}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            border: 'none',
                            background: isCurrentRecording
                              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                              : 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        >
                          {isCurrentRecording ? '⏹' : '🎤'}
                        </button>
                      </div>
                      
                      {/* 语音评分结果 */}
                      {currentPracticingOption === idx && showVoiceResult && voiceScore && (
                        <div style={{
                          position: 'absolute',
                          top: '-60px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(0,0,0,0.85)',
                          borderRadius: '12px',
                          padding: '10px 16px',
                          color: 'white',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          zIndex: 20,
                        }}>
                          <div style={{ marginBottom: '4px' }}>
                            {t('voice.score')}: {voiceScore.score >= 80 ? '🌟' : voiceScore.score >= 60 ? '👍' : '💪'} {voiceScore.score}
                          </div>
                          {voiceScore.recognizedText && (
                            <div style={{ opacity: 0.8, fontSize: '11px' }}>
                              {t('voice.recognized')}: {voiceScore.recognizedText}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* 场景完成提示 */}
          {currentLine.isEnd && (
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              animation: 'scaleIn 0.3s ease',
            }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <div style={{ color: '#22c55e', fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>
                {t('dialog.sceneComplete')}
              </div>
              {currentLine.reward && (
                <div style={{ color: '#1a365d', marginBottom: '20px', fontSize: '15px' }}>
                  <div>⭐ +{currentLine.reward.exp} {t('game.exp')}</div>
                  <div>💰 +{currentLine.reward.coins} {t('game.coins')}</div>
                </div>
              )}
              <button
                type="button"
                onClick={() => completeScene()}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                {t('dialog.continueExplore')}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderCardsView = () => (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      <h2 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '18px' }}>🃏 {t('cards.title')}</h2>
      
      {gameState.cards.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 16px',
          color: theme.textMuted,
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎴</div>
          <div>{t('cards.noCards')}</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>{t('cards.hint')}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {gameState.cards.map(card => (
            <div
              key={card.uniqueId}
              style={{
                background: `linear-gradient(135deg, ${RARITY_COLORS[card.rarity]}22, ${RARITY_COLORS[card.rarity]}08)`,
                border: `2px solid ${RARITY_COLORS[card.rarity]}66`,
                borderRadius: '14px',
                padding: '12px',
                transition: 'transform 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '26px' }}>{card.emoji}</span>
                <div>
                  <div style={{ color: RARITY_COLORS[card.rarity], fontSize: '10px', fontWeight: 'bold' }}>
                    {t(`card.rarity.${card.rarity}`)}
                  </div>
                  <div style={{ color: theme.textPrimary, fontSize: '13px', fontWeight: 'bold' }}>{t(card.nameKey)}</div>
                </div>
              </div>
              <div style={{
                background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '11px',
                color: isDarkMode ? '#a0a0a0' : '#4a5568',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}>
                "{card.sentence}"
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 卡牌统计 */}
      <div style={{
        marginTop: '20px',
        background: theme.cardBg,
        borderRadius: '14px',
        padding: '16px',
        border: `1px solid ${theme.cardBorder}`,
      }}>
        <div style={{ color: theme.textPrimary, fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>{t('cards.progress')}</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(RARITY_COLORS).map(([rarity, color]) => {
            const count = gameState.cards.filter(c => c.rarity === rarity).length
            return (
              <div key={rarity} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
                <span style={{ color: theme.textMuted, fontSize: '11px' }}>{t(`card.rarity.${rarity}`)}: {count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // 渲染城镇视图
  const renderCityView = () => (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      <h2 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '18px' }}>🏘️ {t('town.title')}</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '20px',
      }}>
        {BUILDINGS.map(building => {
          const isOwned = gameState.buildings.includes(building.id)
          const canBuy = gameState.level >= building.unlockLevel && gameState.coins >= building.cost && !isOwned
          
          return (
            <div
              key={building.id}
              style={{
                background: isOwned ? 'rgba(74, 222, 128, 0.12)' : theme.cardBg,
                border: `2px solid ${isOwned ? '#4ade80' : theme.cardBorder}`,
                borderRadius: '14px',
                padding: '12px',
                textAlign: 'center',
                opacity: gameState.level >= building.unlockLevel ? 1 : 0.4,
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>{building.emoji}</div>
              <div style={{ color: theme.textPrimary, fontSize: '12px', fontWeight: 'bold' }}>{t(building.nameKey)}</div>
              {building.descKey && (
                <div style={{ color: theme.textMuted, fontSize: '9px', marginTop: '2px' }}>{t(building.descKey)}</div>
              )}
              {isOwned ? (
                <div style={{ color: '#16a34a', fontSize: '10px', marginTop: '6px', fontWeight: 'bold' }}>✓ {t('town.built')}</div>
              ) : (
                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={() => {
                    if (canBuy) {
                      setGameState(prev => ({
                        ...prev,
                        coins: prev.coins - building.cost,
                        buildings: [...prev.buildings, building.id],
                      }))
                      addLog(`${t('msg.buildLog')} ${building.emoji} ${t(building.nameKey)}`, 'success')
                      showNotify(t('msg.buildSuccess'), `${t(building.nameKey)} ${t('town.built')}`, '🏗️')
                    }
                  }}
                  style={{
                    marginTop: '8px',
                    background: canBuy ? 'linear-gradient(135deg, #22c55e, #16a34a)' : (isDarkMode ? '#333' : '#ccc'),
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    color: canBuy ? 'white' : (isDarkMode ? '#666' : '#888'),
                    fontSize: '10px',
                    cursor: canBuy ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    transition: 'all 0.2s ease',
                  }}
                >
                  💰 {building.cost}
                </button>
              )}
            </div>
          )
        })}
      </div>
      
      {/* 统计 */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '14px',
        padding: '16px',
        border: `1px solid ${theme.cardBorder}`,
      }}>
        <div style={{ color: theme.textPrimary, fontSize: '14px', marginBottom: '14px', fontWeight: 'bold' }}>📊 {t('town.stats')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#16a34a', fontSize: '28px', fontWeight: 'bold' }}>{gameState.stats.scenesCompleted}</div>
            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t('town.scenesCompleted')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#4f46e5', fontSize: '28px', fontWeight: 'bold' }}>
              {gameState.stats.totalAnswers > 0 
                ? Math.round((gameState.stats.correctAnswers / gameState.stats.totalAnswers) * 100) 
                : 0}%
            </div>
            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t('town.accuracy')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#d97706', fontSize: '28px', fontWeight: 'bold' }}>{gameState.cards.length}</div>
            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t('town.cardsCollected')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#dc2626', fontSize: '28px', fontWeight: 'bold' }}>{gameState.buildings.length}</div>
            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t('town.buildingsBuilt')}</div>
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染面试视图
  const renderInterviewView = () => (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      <h2 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '18px' }}>💼 {t('interview.title')}</h2>
      
      <div style={{
        background: theme.accentLight,
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '16px',
        borderLeft: `4px solid ${theme.accent}`,
      }}>
        <div style={{ color: theme.textPrimary, fontSize: '14px', marginBottom: '6px', fontWeight: 'bold' }}>{t('interview.desc')}</div>
        <div style={{ color: theme.textMuted, fontSize: '12px' }}>{t('interview.subtitle')}</div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DIALOG_SCENES.interview.map(scene => {
          const isCompleted = gameState.completedScenes.includes(scene.id)
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => startScene(scene)}
              style={{
                background: isCompleted ? 'rgba(74, 222, 128, 0.1)' : theme.cardBg,
                border: `2px solid ${isCompleted ? '#4ade80' : theme.cardBorder}`,
                borderRadius: '14px',
                padding: '14px',
                textAlign: 'left' as const,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}>
                  {scene.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.textPrimary, fontSize: '15px', fontWeight: 'bold' }}>{t(scene.titleKey)}</div>
                  <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                    {'★'.repeat(scene.difficulty)} · {isCompleted ? t('interview.completed') : t('interview.notCompleted')}
                  </div>
                </div>
                <div style={{ color: theme.accent, fontSize: '18px' }}>▶</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // 渲染成就视图
  const renderAchievementsView = () => (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      <h2 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '18px' }}>🏆 {t('achievement.title')}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = gameState.achievements.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              style={{
                background: isUnlocked ? 'rgba(245, 158, 11, 0.12)' : theme.cardBg,
                border: `2px solid ${isUnlocked ? '#f59e0b' : theme.cardBorder}`,
                borderRadius: '14px',
                padding: '14px',
                opacity: isUnlocked ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: isUnlocked ? 'linear-gradient(135deg, #f59e0b, #d97706)' : (isDarkMode ? '#333' : '#aaa'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: isUnlocked ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                }}>
                  {isUnlocked ? achievement.emoji : '🔒'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.textPrimary, fontSize: '15px', fontWeight: 'bold' }}>{t(achievement.nameKey)}</div>
                  <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t(achievement.descKey)}</div>
                </div>
                {isUnlocked && (
                  <div style={{ color: '#d97706', fontSize: '13px', fontWeight: 'bold' }}>+{achievement.reward} 💰</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // 渲染错题本视图
  const renderWrongAnswersView = () => {
    const wrongAnswers = gameState.wrongAnswers
    const masteredCount = wrongAnswers.filter(w => w.mastered).length
    
    // 删除错题
    const deleteWrongAnswer = (id: string) => {
      setGameState(prev => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers.filter(w => w.id !== id),
      }))
    }
    
    // 标记已掌握
    const toggleMastered = (id: string) => {
      setGameState(prev => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers.map(w => 
          w.id === id ? { ...w, mastered: !w.mastered, reviewCount: w.reviewCount + 1, lastReviewTime: Date.now() } : w
        ),
      }))
    }
    
    return (
      <div style={{ padding: '16px', paddingBottom: '80px' }}>
        <h2 style={{ color: theme.textPrimary, marginBottom: '12px', fontSize: '18px' }}>📝 {t('wrongAnswers.title')}</h2>
        
        {/* 统计信息 */}
        <div style={{ 
          background: theme.cardBg, 
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: '12px', 
          padding: '12px', 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: theme.accent, fontSize: '20px', fontWeight: 'bold' }}>{wrongAnswers.length}</div>
            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t('wrongAnswers.total')} {t('wrongAnswers.items')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: 'bold' }}>{masteredCount}</div>
            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t('wrongAnswers.masteredCount')}</div>
          </div>
        </div>
        
        {wrongAnswers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: theme.textMuted,
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
            <div style={{ fontSize: '15px', marginBottom: '8px' }}>{t('wrongAnswers.empty')}</div>
            <div style={{ fontSize: '12px' }}>{t('wrongAnswers.hint')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {wrongAnswers.map(wrong => (
              <div
                key={wrong.id}
                style={{
                  background: wrong.mastered ? 'rgba(34, 197, 94, 0.1)' : theme.cardBg,
                  border: `2px solid ${wrong.mastered ? '#22c55e' : theme.cardBorder}`,
                  borderRadius: '14px',
                  padding: '12px',
                  opacity: wrong.mastered ? 0.7 : 1,
                }}
              >
                {/* 场景信息 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginBottom: '8px',
                  color: theme.textMuted,
                  fontSize: '11px',
                }}>
                  <span>📍</span>
                  <span>{t(wrong.sceneNameKey)}</span>
                  <span>·</span>
                  <span>{t(`city.${wrong.cityId}`)}</span>
                  {wrong.mastered && <span style={{ color: '#22c55e' }}>✓ {t('wrongAnswers.mastered')}</span>}
                </div>
                
                {/* 问题 */}
                {wrong.question && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '2px' }}>{t('wrongAnswers.question')}</div>
                    <div style={{ color: theme.textPrimary, fontSize: '13px' }}>{wrong.question}</div>
                  </div>
                )}
                
                {/* 你的答案（错误） */}
                <div style={{ 
                  marginBottom: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                }}>
                  <div style={{ color: '#ef4444', fontSize: '10px', marginBottom: '2px' }}>✗ {t('wrongAnswers.yourAnswer')}</div>
                  <div style={{ color: theme.textPrimary, fontSize: '13px' }}>{wrong.userOption.text}</div>
                  {wrong.userOption.translation && (
                    <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '2px' }}>{wrong.userOption.translation}</div>
                  )}
                </div>
                
                {/* 正确答案 */}
                <div style={{ 
                  marginBottom: '10px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                }}>
                  <div style={{ color: '#22c55e', fontSize: '10px', marginBottom: '2px' }}>✓ {t('wrongAnswers.correctAnswer')}</div>
                  <div style={{ color: theme.textPrimary, fontSize: '13px' }}>{wrong.correctOption.text}</div>
                  {wrong.correctOption.translation && (
                    <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '2px' }}>{wrong.correctOption.translation}</div>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => toggleMastered(wrong.id)}
                    style={{
                      flex: 1,
                      background: wrong.mastered ? 'rgba(34, 197, 94, 0.2)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {wrong.mastered ? '↩️ ' + t('wrongAnswers.review') : '✓ ' + t('wrongAnswers.markMastered')}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteWrongAnswer(wrong.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 渲染通知
  const renderNotification = () => notification.show && (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '16px',
      right: '16px',
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      borderRadius: '14px',
      padding: '14px 18px',
      boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
      zIndex: 1000,
      animation: 'slideDown 0.3s ease',
    }}>
      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '18px' }}>{notification.emoji}</span>
        {notification.title}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', marginTop: '4px' }}>{notification.text}</div>
    </div>
  )

  // 渲染卡牌获得弹窗
  const renderCardObtain = () => showCardObtain && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1002,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${RARITY_COLORS[showCardObtain.rarity]}33, ${RARITY_COLORS[showCardObtain.rarity]}11)`,
        border: `3px solid ${RARITY_COLORS[showCardObtain.rarity]}`,
        borderRadius: '20px',
        padding: '28px',
        textAlign: 'center',
        maxWidth: '280px',
        animation: 'scaleIn 0.3s ease',
      }}>
        <div style={{ color: RARITY_COLORS[showCardObtain.rarity], fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
          {t(`card.rarity.${showCardObtain.rarity}`).toUpperCase()} {t('cards.newCard')}
        </div>
        <div style={{ fontSize: '64px', marginBottom: '12px' }}>{showCardObtain.emoji}</div>
        <div style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{t(showCardObtain.nameKey)}</div>
        <div style={{
          background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '13px',
          color: isDarkMode ? '#a0a0a0' : '#4a5568',
          fontStyle: 'italic',
          marginBottom: '16px',
        }}>
          "{showCardObtain.sentence}"
        </div>
        <button
          type="button"
          onClick={() => setShowCardObtain(null)}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 36px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {t('common.confirm')}
        </button>
      </div>
    </div>
  )

  // 渲染鼓励弹窗
  const renderEncouragement = () => showEncouragement && (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))',
      borderRadius: '24px',
      padding: '32px 48px',
      textAlign: 'center',
      zIndex: 1004,
      animation: 'scaleIn 0.3s ease-out',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>{showEncouragement.emoji}</div>
      <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
        {showEncouragement.text}
      </div>
    </div>
  )

  // 渲染每日任务视图
  const renderDailyTasksView = () => (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      <h2 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '18px' }}>📅 {t('tasks.title')}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DAILY_TASKS.map(task => {
          const progress = gameState.dailyTasks[task.id] || 0
          const completed = progress >= task.target
          
          return (
            <div
              key={task.id}
              style={{
                background: completed ? 'rgba(74, 222, 128, 0.15)' : theme.cardBg,
                border: `2px solid ${completed ? '#4ade80' : theme.cardBorder}`,
                borderRadius: '14px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>{task.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.textPrimary, fontSize: '14px', fontWeight: 'bold' }}>{t(task.nameKey)}</div>
                  <div style={{ 
                    height: '6px', 
                    background: theme.cardBorder, 
                    borderRadius: '3px',
                    marginTop: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.min(100, (progress / task.target) * 100)}%`,
                      height: '100%',
                      background: completed ? '#4ade80' : '#667eea',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>
                    {progress}/{task.target}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#d97706', fontSize: '12px', fontWeight: 'bold' }}>+{task.reward.coins} 💰</div>
                  <div style={{ color: '#16a34a', fontSize: '11px', fontWeight: 'bold' }}>+{task.reward.exp} ⭐</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 连胜记录 */}
      <div style={{
        marginTop: '24px',
        background: theme.cardBg,
        borderRadius: '14px',
        padding: '16px',
        border: `1px solid ${theme.cardBorder}`,
      }}>
        <div style={{ color: theme.textPrimary, fontSize: '14px', marginBottom: '12px', fontWeight: 'bold' }}>🔥 {t('streak.record')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ color: '#f59e0b', fontSize: '28px', fontWeight: 'bold' }}>{gameState.currentStreak}</div>
            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t('streak.current')}</div>
          </div>
          <div>
            <div style={{ color: '#ef4444', fontSize: '28px', fontWeight: 'bold' }}>{gameState.maxStreak}</div>
            <div style={{ color: theme.textMuted, fontSize: '11px' }}>{t('streak.max')}</div>
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染排行榜视图
  const renderRankingsView = () => {
    // 当切换到排行榜时加载数据
    if (rankings.length === 0 && !isLoadingRankings) {
      fetchRankings()
    }
    
    return (
      <div style={{ padding: '16px', paddingBottom: '80px' }}>
        <h2 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏆 {t('rankings.title')}
        </h2>
        
        {/* 刷新按钮 */}
        <button
          type="button"
          onClick={fetchRankings}
          disabled={isLoadingRankings}
          style={{
            width: '100%',
            background: theme.accentLight,
            border: `1px solid ${theme.accent}`,
            borderRadius: '12px',
            padding: '10px',
            color: '#a5b4fc',
            fontSize: '13px',
            cursor: isLoadingRankings ? 'wait' : 'pointer',
            marginBottom: '16px',
          }}
        >
          {isLoadingRankings ? `🔄 ${t('rankings.loading')}` : `🔄 ${t('rankings.refresh')}`}
        </button>
        
        {isLoadingRankings && rankings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div>{t('rankings.loading')}</div>
          </div>
        ) : rankings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <div>{t('rankings.noData')}</div>
          </div>
        ) : (
          <>
            {/* 前三名特殊展示 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {rankings.slice(0, 3).map((r, i) => (
                <div
                  key={r.userId}
                  style={{
                    background: i === 0 
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                      : i === 1 
                        ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                        : 'linear-gradient(135deg, #cd7f32, #b87333)',
                    borderRadius: '16px',
                    padding: '14px',
                    textAlign: 'center',
                    minWidth: '90px',
                    transform: i === 0 ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: i === 0 ? '0 8px 30px rgba(251, 191, 36, 0.3)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </div>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{r.avatar}</div>
                  <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {r.nickname}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px' }}>
                    Lv.{r.level}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 排行列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rankings.map((r) => {
                const isCurrentUser = r.userId === user?.id
                return (
                  <div
                    key={r.userId}
                    style={{
                      background: isCurrentUser 
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.15))'
                        : theme.cardBg,
                      border: isCurrentUser 
                        ? '2px solid rgba(102, 126, 234, 0.5)'
                        : `1px solid ${theme.cardBorder}`,
                      borderRadius: '14px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    {/* 排名 */}
                    <div style={{
                      minWidth: '36px',
                      textAlign: 'center',
                      color: r.rank <= 3 ? '#fbbf24' : theme.textMuted,
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}>
                      {r.rank}
                    </div>
                    
                    {/* 头像 */}
                    <div style={{ fontSize: '28px' }}>{r.avatar}</div>
                    
                    {/* 信息 */}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: theme.textPrimary, fontSize: '14px', fontWeight: 'bold' }}>
                        {r.nickname}
                        {isCurrentUser && <span style={{ color: theme.accent, marginLeft: '6px', fontSize: '11px' }}>({t('rankings.you')})</span>}
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '2px' }}>
                        Lv.{r.level} · {r.scenesCompleted}{t('town.scenesCompleted')} · {r.accuracy}%{t('town.accuracy')}
                      </div>
                    </div>
                    
                    {/* 经验 */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: theme.accent, fontSize: '14px', fontWeight: 'bold' }}>
                        {formatNumber(r.exp)}
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: '10px' }}>EXP</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  // 主渲染
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: theme.bgGradient,
      minHeight: '100vh',
      color: theme.textPrimary,
      transition: 'background 0.5s ease, color 0.5s ease',
    }}>
      {/* 粒子效果 */}
      <ParticleEffect active={showParticles} color={particleColor} />
      
      {/* 升级星星爆炸特效 */}
      <StarBurstEffect active={showStarBurst} />
      
      {/* 连胜火焰特效 */}
      <StreakFireEffect active={showStreakFire} streak={gameState.currentStreak} />
      
      {/* 彩带特效 */}
      <ConfettiEffect active={showConfetti} colors={confettiColors} />
      
      {/* 浮动文字 */}
      {floatingTexts.map(ft => (
        <FloatingTextComponent key={ft.id} text={ft} />
      ))}
      
      {/* 鼓励弹窗 */}
      {renderEncouragement()}
      
      {renderLevelBar()}
      
      {gameMode === 'dialog' || gameMode === 'result' 
        ? renderDialogView()
        : (
          <>
            {activeTab === 'map' && renderMapView()}
            {activeTab === 'cards' && renderCardsView()}
            {activeTab === 'city' && renderCityView()}
            {activeTab === 'interview' && renderInterviewView()}
            {activeTab === 'achievements' && renderAchievementsView()}
            {activeTab === 'tasks' && renderDailyTasksView()}
            {activeTab === 'rankings' && renderRankingsView()}
            {activeTab === 'wrongAnswers' && renderWrongAnswersView()}
          </>
        )
      }
      
      {renderBottomNav()}
      {renderNotification()}
      {renderCardObtain()}
      
      {/* 游戏引导 */}
      {gameState.tutorialStep >= 0 && gameState.tutorialStep < TUTORIAL_STEPS.length && (
        <TutorialOverlay
          step={TUTORIAL_STEPS[gameState.tutorialStep]}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
          targetRef={getTutorialTargetRef(TUTORIAL_STEPS[gameState.tutorialStep].id)}
          t={t}
        />
      )}
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-60px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}
