import cv2
import dlib
import numpy as np
import os

# Constants
FACES_FOLDER = "/Users/mrityunjaoysaha/Desktop/facial_recognition/faces"
FACE_RECOGNITION_THRESHOLD = 0.6  # Adjust this threshold as needed

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
    for k, d in enumerate(detected_faces):
        shape = shape_predictor(frame, d)
        face_descriptor = face_rec_model.compute_face_descriptor(frame, shape)
        face_encodings.append(np.array(face_descriptor))
    return face_encodings, detected_faces

# Function to recognize faces
def recognize_faces(frame):
    # Extract face encodings from the frame
    face_encodings, face_locations = extract_face_encodings(frame)

    # Initialize lists to store recognized names and distances
    recognized_names = []
    percentages = []

    # Compare face encodings with known face encodings
    if known_face_encodings and face_encodings:  # Check if there are any known face encodings and detected faces
        for face_encoding in face_encodings:
            # Compute distance between the current face encoding and all known face encodings
            face_distances = [compute_distance(face_encoding, known_face_encoding) for known_face_encoding in known_face_encodings]

            # Find all indices with distances below the threshold (matching faces)
            matching_indices = [i for i, distance in enumerate(face_distances) if distance < FACE_RECOGNITION_THRESHOLD]

            # Get corresponding names and percentages
            matching_names = [known_face_names[i] for i in matching_indices]
            matching_percentages = [100 - distance * 100 for distance in face_distances if distance < FACE_RECOGNITION_THRESHOLD]

            # Append matching names and percentages to the recognized_names and percentages lists
            recognized_names.append(matching_names)
            percentages.append(matching_percentages)

    return recognized_names, percentages, face_locations

# Load known face encodings and their names
known_face_encodings = []  # List to store known face encodings
known_face_names = []  # List to store corresponding known face names

# Load face images from the "faces" folder and generate their encodings
for file_name in os.listdir(FACES_FOLDER):
    if file_name.endswith(('.jpg', '.png', '.jpeg')):
        image_path = os.path.join(FACES_FOLDER, file_name)
        face_image = cv2.imread(image_path)
        face_encodings, _ = extract_face_encodings(face_image)
        if face_encodings:
            known_face_encodings.append(face_encodings[0])
            known_face_names.append(os.path.splitext(file_name)[0])

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
    recognized_names, percentages, face_locations = recognize_faces(rgb_frame)

    # Display recognized names and percentages
    for names, percents, face_loc in zip(recognized_names, percentages, face_locations):
        top, right, bottom, left = face_loc.top(), face_loc.right(), face_loc.bottom(), face_loc.left()
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
        text = ', '.join([f"{name} ({percent:.2f}%)" for name, percent in zip(names, percents)])
        cv2.putText(frame, text, (left, bottom + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1, cv2.LINE_AA)

    # Display the resulting image
    cv2.imshow('Webcam Facial Recognition', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
