import face_recognition
import os, sys
import cv2
import numpy as np
import math

def face_confidence(face_distance, face_match_threshold=0.6):
    range = (1.0 - face_match_threshold)
    linear_val = (1.0 - face_distance)/(range * 2.0)

    if face_distance > face_match_threshold:
        return str(round(linear_val * 100, 2)) + '%'
    else:
        value = (linear_val +((1.0 - linear_val) * math.pow((linear_val - 0.5) * 2, 0.2))) * 100
        return str(round(value, 2)) + '%'
    
class FaceRecognition:
    face_locations = []
    face_encodings = []
    face_names = []
    known_face_encodings = []
    known_face_names = []
    process_current_frame = True

    def __init__(self):
        self.encode_faces()
    
    def encode_faces(self):
        # List of valid image extensions, consider adding more if needed.
        valid_extensions = ['.jpg', '.jpeg', '.png']
        for image in os.listdir('faces'):
            # Check if the file has a valid image file extension before processing.
            if any(image.lower().endswith(ext) for ext in valid_extensions):
                face_image = face_recognition.load_image_file(f'faces/{image}')
                # Some images might not contain faces, which would cause face_encodings to be empty.
                # We should only proceed if face_encodings is not empty to avoid indexing errors.
                face_encodings = face_recognition.face_encodings(face_image)
                if face_encodings:
                    face_encoding = face_encodings[0]
                    self.known_face_encodings.append(face_encoding)
                    # You might want to use os.path.splitext to remove the file extension.
                    self.known_face_names.append(os.path.splitext(image)[0])
                else:
                    print(f"No faces found in the image '{image}'.")
            else:
                print(f"Skipping non-image file: {image}")

        print(self.known_face_names)

    def run_recognition(self):
        video_capture = cv2.VideoCapture(0)

        if not video_capture.isOpened():
            sys.exit('Video Source not found...')

        while True:
            ret, frame = video_capture.read()

            if self.process_current_frame:
                # Resize frame for faster face detection processing
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                rgb_small_frame = small_frame[:, :, ::-1]

                # Find all face locations in the current frame
                self.face_locations = face_recognition.face_locations(rgb_small_frame)

                # Correctly use face locations to get face encodings
                if self.face_locations:
                    self.face_encodings = face_recognition.face_encodings(rgb_small_frame, self.face_locations)

                    self.face_names = []
                    for face_encoding in self.face_encodings:
                        matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
                        name = 'Unknown'
                        confidence = 'Unknown'

                        if len(matches) > 0 and any(matches):
                            best_match_index = np.argmin(face_recognition.face_distance(self.known_face_encodings, face_encoding))
                            if matches[best_match_index]:
                                name = self.known_face_names[best_match_index]
                                confidence = self.face_confidence(face_recognition.face_distance(self.known_face_encodings, face_encoding)[best_match_index])

                        self.face_names.append(f'{name}({confidence})')

            self.process_current_frame = not self.process_current_frame

            # Display results
            for (top, right, bottom, left), name in zip(self.face_locations, self.face_names):
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4

                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
                cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
                cv2.putText(frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)

            cv2.imshow('Face Recognition', frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        video_capture.release()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    fr = FaceRecognition()
    fr.run_recognition()