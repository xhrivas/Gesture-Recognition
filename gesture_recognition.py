import cv2
import mediapipe as mp

# Initialize MediaPipe Hands
mpHands = mp.solutions.hands
hands = mpHands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)
mpDraw = mp.solutions.drawing_utils

# Finger tip landmark indices
tipIds = [4, 8, 12, 16, 20]

# Start video capture
cap = cv2.VideoCapture(0)

def get_finger_states(lmList):
    fingers = []

    # Thumb
    if lmList[tipIds[0]][1] > lmList[tipIds[0] - 1][1]:  # Right hand logic
        fingers.append(1)
    else:
        fingers.append(0)

    # Fingers
    for id in range(1, 5):
        if lmList[tipIds[id]][2] < lmList[tipIds[id] - 2][2]:
            fingers.append(1)
        else:
            fingers.append(0)

    return fingers

def classify_gesture(fingers):
    # Simple hardcoded examples
    if fingers == [0, 0, 0, 0, 0]:
        return "A"
    elif fingers == [0, 1, 1, 1, 1]:
        return "B"
    elif fingers == [0, 1, 0, 0, 0]:
        return "D"
    elif fingers == [0, 1, 1, 0, 0]:
        return "L"
    elif fingers == [0, 1, 1, 1, 0]:
        return "W"
    elif fingers == [1, 1, 1, 1, 1]:
        return "5"
    else:
        return "-"

while True:
    success, img = cap.read()
    img = cv2.flip(img, 1)  # Mirror image
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(imgRGB)

    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            lmList = []
            h, w, _ = img.shape
            for id, lm in enumerate(handLms.landmark):
                cx, cy = int(lm.x * w), int(lm.y * h)
                lmList.append([id, cx, cy])

            if lmList:
                fingers = get_finger_states(lmList)
                letter = classify_gesture(fingers)
                cv2.putText(img, f'Letter: {letter}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX,
                            2, (0, 255, 0), 3)

            mpDraw.draw_landmarks(img, handLms, mpHands.HAND_CONNECTIONS)
            

    cv2.imshow("Gesture to Alphabet", img)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    
cap.release()
cv2.destroyAllWindows()