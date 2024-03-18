import cv2
import dlib
import numpy as np
import os

# Constants
FACES_FOLDER = "/Users/mrityunjaoysaha/Desktop/facial_recognition/faces"
FACE_RECOGNITION_THRESHOLD = 0.6  # Adjust this threshold as needed
MATCH_THRESHOLD = 0.4  # Threshold to consider as a match

# Update these paths to where you've stored the model files
predictor_path = "/Users/mrityunjaoysaha/Desktop/facial_recognition/shape_predictor_68_face_landmarks.dat"
face_rec_model_path = "/Users/mrityunjaoysaha/Desktop/facial_recognition/dlib_face_recognition_resnet_model_v1.dat"

# Initialize dlib's face detector, shape predictor, and face recognition model
detector = dlib.get_frontal_face_detector()
shape_predictor = dlib.shape_predictor(predictor_path)
face_rec_model = dlib.face_recognition_model_v1(face_rec_model_path)

# Function to compute Euclidean distance between two face encodings
def compute_distance(encoding1, encoding2):
    return np.linalg.norm(encoding1 - encoding2)

# Function to extract face encodings using dlib
def extract_face_encodings(frame):
    detected_faces = detector(frame, 1)
    face_encodings = []
    face_locations = []  # Store the face locations
    for k, d in enumerate(detected_faces):
        shape = shape_predictor(frame, d)
        face_descriptor = face_rec_model.compute_face_descriptor(frame, shape)
        face_encodings.append(np.array(face_descriptor))
        face_locations.append(d)  # Store the face location
    return face_encodings, face_locations

# Load known face encodings and their names
known_faces = {}  # Dictionary to store known face encodings and their corresponding names

# Load face images from the "faces" folder and generate their encodings
for person_folder in os.listdir(FACES_FOLDER):
    person_folder_path = os.path.join(FACES_FOLDER, person_folder)
    if os.path.isdir(person_folder_path):  # If it's a folder, treat it as a person's name
        person_name = person_folder
        person_encodings = []
        for file_name in os.listdir(person_folder_path):
            if file_name.endswith(('.jpg', '.png', '.jpeg')):
                image_path = os.path.join(person_folder_path, file_name)
                face_image = cv2.imread(image_path)
                face_encodings, _ = extract_face_encodings(face_image)
                if face_encodings:
                    person_encodings.extend(face_encodings)
        if person_encodings:
            # Compute the average encoding for this person
            avg_encoding = np.mean(person_encodings, axis=0)
            known_faces[person_name] = avg_encoding

# Webcam capture
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Camera could not be accessed.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture frame.")
        break
    
    # Convert to RGB since dlib uses RGB format
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Recognize faces
    face_encodings, face_locations = extract_face_encodings(rgb_frame)
    recognized_names = []

    # Compare face encodings with known face encodings
    for face_encoding, face_location in zip(face_encodings, face_locations):
        min_distance = float('inf')  # Initialize minimum distance
        matching_names = []
        for name, encoding in known_faces.items():
            distance = compute_distance(face_encoding, encoding)
            if distance < FACE_RECOGNITION_THRESHOLD and distance < MATCH_THRESHOLD:
                matching_names.append((name, 100 - distance * 100))
        if matching_names:
            recognized_names.append(matching_names)

        # Unpack the face location and draw rectangle
        top, right, bottom, left = face_location.top(), face_location.right(), face_location.bottom(), face_location.left()
        if matching_names:
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)  # Draw green boundary
        else:
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)  # Draw red boundary
        
        # Display the names and percentages under the bounding box
        text_y = bottom + 20
        for name, percentage in matching_names:
            cv2.putText(frame, f"{name} ({percentage:.2f}%)", (left, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1, cv2.LINE_AA)
            text_y += 20

    # Display the resulting image
    cv2.imshow('Webcam Facial Recognition', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()