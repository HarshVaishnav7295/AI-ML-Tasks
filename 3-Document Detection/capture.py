import cv2
import time
from demo import main

# Global variables
rectangle_completed = True  # Set to True to indicate that the rectangle is already drawn
rectangle_coordinates = (100, 100, 450, 400)  # (x1, y1, x2, y2) coordinates of the rectangle

# Define the duration (in seconds) of the video capture here
capture_duration = 10

start_time = time.time()

# Initialize webcam
cap = cv2.VideoCapture(0)

while( int(time.time() - start_time) < capture_duration ):

    ret, frame = cap.read()

    if not ret:
        break

    # Draw the rectangle on the frame
    x1, y1, x2, y2 = rectangle_coordinates
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    # Display frame
    cv2.imshow('Fixed Rectangle', frame)

    # Extract the region of interest (ROI) inside the rectangle
    roi = frame[y1:y2, x1:x2]
    # cv2.imshow('Extracted Image', roi)
    cv2.imwrite('extracted_image.png', roi)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

IMAGE_SIZE = 384
procedure_selected = "Deep Learning"
file_upload = "extracted_image.png"
_ = main(input_file=file_upload, procedure=procedure_selected, image_size=IMAGE_SIZE)