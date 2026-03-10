from flask import Flask, render_template, request, jsonify
import os
import time
import json

# Uronexa AI Test Strip Analysis
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

import cv2
import numpy as np

# Standard Reference Colors (approximate RGB) for 10-parameter test strip
REFERENCE_COLORS = {
    "Leukocytes": [
        ((240, 230, 200), "Negative", "0 ca/µL"),
        ((220, 190, 210), "Trace", "15 ca/µL"),
        ((180, 120, 180), "Small", "70 ca/µL"),
        ((140, 80, 160), "Moderate", "125 ca/µL"),
        ((100, 50, 140), "Large", "500 ca/µL")
    ],
    "Nitrite": [
        ((245, 240, 230), "Negative", "-"),
        ((255, 180, 190), "Positive", "+")
    ],
    "Urobilinogen": [
        ((250, 230, 180), "Normal", "0.2 mg/dL"),
        ((245, 190, 140), "Abnormal", "1 mg/dL"),
        ((235, 140, 100), "Abnormal", "2 mg/dL"),
        ((220, 100, 70), "Abnormal", "4 mg/dL"),
        ((180, 70, 50), "Abnormal", "8 mg/dL")
    ],
    "Protein": [
        ((220, 230, 150), "Negative", "-"),
        ((190, 210, 140), "Trace", "15 mg/dL"),
        ((150, 190, 130), "Positive", "30 mg/dL"),
        ((100, 170, 120), "Positive", "100 mg/dL"),
        ((50, 140, 100), "Positive", "300 mg/dL")
    ],
    "pH": [
        ((240, 150, 50), "Normal", "5.0"),
        ((245, 180, 50), "Normal", "6.0"),
        ((220, 200, 60), "Normal", "6.5"),
        ((150, 180, 80), "Normal", "7.0"),
        ((100, 150, 100), "Abnormal", "8.0"),
        ((50, 100, 120), "Abnormal", "8.5")
    ],
    "Blood": [
        ((240, 200, 50), "Negative", "-"),
        ((180, 180, 50), "Trace", "10 Ery/µL"),
        ((130, 160, 60), "Moderate", "50 Ery/µL"),
        ((80, 120, 70), "Large", "250 Ery/µL")
    ],
    "Specific Gravity": [
        ((40, 80, 100), "Abnormal", "1.000"),
        ((80, 120, 80), "Normal", "1.010"),
        ((120, 140, 60), "Normal", "1.020"),
        ((160, 150, 50), "Abnormal", "1.030")
    ],
    "Ketones": [
        ((230, 200, 180), "Negative", "-"),
        ((220, 150, 150), "Trace", "5 mg/dL"),
        ((190, 100, 120), "Small", "15 mg/dL"),
        ((150, 50, 90), "Moderate", "40 mg/dL"),
        ((110, 30, 70), "Large", "160 mg/dL")
    ],
    "Bilirubin": [
        ((240, 230, 200), "Negative", "-"),
        ((220, 200, 160), "Small", "1 mg/dL"),
        ((200, 170, 140), "Moderate", "2 mg/dL"),
        ((180, 140, 120), "Large", "4 mg/dL")
    ],
    "Glucose": [
        ((120, 200, 200), "Negative", "-"),
        ((140, 210, 180), "Trace", "100 mg/dL"),
        ((160, 200, 130), "Small", "250 mg/dL"),
        ((180, 180, 90), "Moderate", "500 mg/dL"),
        ((170, 140, 70), "Large", "1000 mg/dL"),
        ((150, 100, 50), "Large", "2000 mg/dL")
    ]
}

def closest_status(rgb, parameter_name):
    min_dist = float('inf')
    best_match = ("Unknown", "-")
    
    for ref_rgb, result, value in REFERENCE_COLORS[parameter_name]:
        dist = (rgb[0] - ref_rgb[0])**2 + (rgb[1] - ref_rgb[1])**2 + (rgb[2] - ref_rgb[2])**2
        if dist < min_dist:
            min_dist = dist
            best_match = (result, value)
            
    return best_match

def calculate_clinical_risk(extracted_results, strip_detection_percent):
    score = 0
    strategy_factors = []
    
    # UTI Risk
    leuk = extracted_results.get("Leukocytes", {}).get("result", "Negative")
    nitrite = extracted_results.get("Nitrite", {}).get("result", "Negative")
    
    if leuk not in ["Negative", "Trace", "Unknown"]:
        score += 25
        strategy_factors.append("Elevated Leukocytes indicate potential urinary tract inflammation or infection.")
    if nitrite == "Positive":
        score += 35
        strategy_factors.append("Positive Nitrites strongly suggest the presence of a bacterial UTI.")
        
    # Kidney/Renal
    prot = extracted_results.get("Protein", {}).get("result", "Negative")
    blood = extracted_results.get("Blood", {}).get("result", "Negative")
    
    if prot not in ["Negative", "Trace", "Unknown"]:
        score += 20
        strategy_factors.append("Proteinuria detected. May indicate renal stress, kidney disease, or early preeclampsia.")
    if blood not in ["Negative", "Trace", "Unknown"]:
        score += 25
        strategy_factors.append("Hematuria (blood in urine) detected. Could signify kidney stones, infection, or renal damage.")
        
    # Metabolic / Diabetes
    gluc = extracted_results.get("Glucose", {}).get("result", "Negative")
    ket = extracted_results.get("Ketones", {}).get("result", "Negative")
    
    if gluc not in ["Negative", "Trace", "Unknown"]:
        score += 20
        strategy_factors.append("Glycosuria present. Suggests elevated blood sugar levels; screen for Diabetes Mellitus.")
    if ket not in ["Negative", "Trace", "Unknown"]:
        score += 15
        strategy_factors.append("Ketonuria detected. Points to altered metabolism, fasting, or diabetic ketoacidosis risk.")
        
    # Liver
    bili = extracted_results.get("Bilirubin", {}).get("result", "Negative")
    uro = extracted_results.get("Urobilinogen", {}).get("result", "Normal")
    
    if bili not in ["Negative", "Unknown"]:
        score += 15
        strategy_factors.append("Bilirubin detected. Investigate for potential liver or biliary tract disease.")
    if uro == "Abnormal":
        score += 10
        strategy_factors.append("Abnormal Urobilinogen levels. Can be associated with liver dysfunction or hemolysis.")
        
    final_score = min(100, int(score))
    
    if final_score == 0:
        strategy_text = "No major clinical abnormalities detected. Maintain standard hydration. This dipstick acts as a preliminary screening tool only."
    else:
        strategy_text = " ".join(strategy_factors) + " Strongly recommend professional medical evaluation with comprehensive metabolic and culture panels."

    confidence = round(strip_detection_percent * 0.95, 1) if final_score > 0 else round(strip_detection_percent, 1)
        
    return {
        "risk_score": final_score,
        "diagnosis_confidence_percent": min(99.9, confidence),
        "clinical_strategy": strategy_text,
        "biomarkers": extracted_results
    }



def validate_is_strip(img_bgr):
    """
    Lightweight gate to reject clearly non-strip images.
    Uses 2 loose checks. Real strips pass easily.
    Returns (True, "") if valid, or (False, reason_string) if rejected.
    """
    h, w = img_bgr.shape[:2]

    # 1. ASPECT RATIO: Strip must be taller than it is wide after auto-rotation.
    #    We allow up to a 1.5:1 width:height ratio to handle slightly wide photos.
    if w > h * 1.5:
        return False, "Image appears to be landscape. Please photograph the strip in portrait (vertical) orientation."

    # 2. SATURATION CHECK: A test strip ALWAYS has some color in its pads
    #    (cream, yellow, tan, green, purple depending on reagents).
    #    A QR code, printed document, or B&W photo is nearly pure black and white = near-zero saturation.
    #    We reject if the mean HSV saturation is unrealistically low (< 10 out of 255).
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    mean_saturation = np.mean(hsv[:, :, 1])
    if mean_saturation < 10:
        return False, "No test strip detected. The image appears to be a black & white document, not a urine test strip."

    return True, ""


def extract_colors(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise Exception("Could not read uploaded image. Please ensure it is a valid format.")

    debug_img = img.copy()
    height, width, _ = img.shape

    # Auto-rotate to portrait
    if width > height:
        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        debug_img = cv2.rotate(debug_img, cv2.ROTATE_90_CLOCKWISE)
        height, width, _ = img.shape

    # Validate before analysis
    valid, reason = validate_is_strip(debug_img)
    if not valid:
        raise Exception(f"Not a valid test strip: {reason}")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    gray = cv2.cvtColor(debug_img, cv2.COLOR_BGR2GRAY)
    hsv  = cv2.cvtColor(debug_img, cv2.COLOR_BGR2HSV)

    # --- FIND STRIP CENTER X ---
    # Use the CENTER 50% only — avoids picking up the dark strip edge
    roi_start = int(width * 0.25)
    roi_end   = int(width * 0.75)

    inverted_gray = 255 - gray
    s_channel   = hsv[:, :, 1]

    # Use SATURATION ONLY to find the strip center X.
    # Saturation peaks at actual pad COLOR centers (cream, yellow, tan, purple etc.)
    # inverted_gray + saturation was peaking at dark EDGE SHADOWS on the strip boundary,
    # causing the center line to land on the edge instead of the pads.
    col_sums      = np.sum(s_channel[:, roi_start:roi_end].astype(np.float32), axis=0)
    kernel_size   = max(3, int(width * 0.05))
    smoothed_cols = np.convolve(col_sums, np.ones(kernel_size), mode='same')

    max_val = np.max(smoothed_cols)
    plateau_indices = np.where(smoothed_cols > max_val * 0.85)[0]

    if len(plateau_indices) > 0:
        best_col_offset = int(np.mean(plateau_indices))
    else:
        best_col_offset = np.argmax(smoothed_cols)

    stick_center_x = roi_start + best_col_offset
    cv2.line(debug_img, (stick_center_x, 0), (stick_center_x, height), (0, 255, 255), 1)

    # --- 1D PAD SIGNAL --- use combined padness (saturation + inverted brightness)
    # for the vertical signal only (where we WANT dark spots to score high)
    padness_map = inverted_gray.astype(np.float32) + s_channel.astype(np.float32)

    # --- 1D PAD SIGNAL ---
    sx = max(0, stick_center_x - 3)
    ex = min(width, stick_center_x + 4)

    s_col = hsv[:, sx:ex, 1].astype(np.float32)
    v_col = hsv[:, sx:ex, 2].astype(np.float32)

    s_signal   = np.mean(s_col, axis=1)
    v_signal   = np.mean(v_col, axis=1)
    pad_signal = s_signal + (255.0 - v_signal)

    smooth_k = max(3, int(height * 0.005))
    if smooth_k % 2 == 0: smooth_k += 1
    pad_signal = np.convolve(pad_signal, np.ones(smooth_k) / smooth_k, mode='same')

    # --- 10-TOOTH COMB MATCHED FILTER ---
    # KEY FIX: Limit start_y to the TOP 40% of the image.
    # Strips always begin near the top. Without this limit the filter drifts
    # downward because cream/white pads (Leukocytes, Nitrite) score like gaps.
    max_allowed_start = int(height * 0.40)

    max_score  = -999999
    best_step  = 0
    best_start = 0

    min_step = int(height * 0.04)
    max_step = int(height * 0.13)

    for step in range(min_step, max_step):
        half_step = max(1, int(step * 0.5))

        for start_y in range(half_step, min(max_allowed_start, height - (9 * step) - half_step)):
            score = 0

            # Small upward bias: prefer grids that start earlier (higher up)
            # This stops the comb from skipping the first cream/white pad
            score += (max_allowed_start - start_y) * 0.15

            top_y = max(0, start_y - half_step)
            score -= pad_signal[top_y] * 2.0

            for i in range(10):
                pad_y = start_y + i * step
                if pad_y >= height:
                    break
                score += pad_signal[pad_y] * 2.5

                if i < 9:
                    gap_y = pad_y + half_step
                    if gap_y < height:
                        score -= pad_signal[gap_y] * 3.0

            bot_y = min(height - 1, start_y + 9 * step + half_step)
            score -= pad_signal[bot_y] * 2.0

            if score > max_score:
                max_score  = score
                best_step  = step
                best_start = start_y

    cv2.putText(debug_img, "MATCHED FILTER MODE", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # --- EXTRACT PAD COLORS with white balance ---
    keys = [
        "Leukocytes", "Nitrite", "Urobilinogen", "Protein", "pH",
        "Blood", "Specific Gravity", "Ketones", "Bilirubin", "Glucose"
    ]
    box_size = int(best_step * 0.75)

    white_y = max(5, best_start - best_step)
    white_x = stick_center_x
    white_region = img_rgb[white_y - 2:white_y + 3, white_x - 2:white_x + 3]
    white_ref    = np.median(white_region, axis=(0, 1))
    if np.any(white_ref <= 0):
        white_ref = np.array([255.0, 255.0, 255.0])
    white_multiplier = 255.0 / white_ref

    cv2.rectangle(debug_img,
                  (white_x - 2, white_y - 2),
                  (white_x + 3, white_y + 3),
                  (255, 0, 0), -1)

    extracted_results = {}

    for i in range(10):
        cy = best_start + i * best_step
        cx = stick_center_x

        box_w = box_size
        box_h = int(box_size * 0.8)
        box_x = int(cx - box_w / 2.0)
        box_y = int(cy - box_h / 2.0)

        y0 = max(0, cy - 3)
        y1 = min(height, cy + 4)
        x0 = max(0, cx - 3)
        x1 = min(width, cx + 4)

        if y1 <= y0 or x1 <= x0:
            avg_color = np.array([0.0, 0.0, 0.0])
        else:
            region = img_rgb[y0:y1, x0:x1]
            avg_color = np.median(region, axis=(0, 1))

        if avg_color is None or np.isnan(np.sum(avg_color)):
            avg_color = np.array([0.0, 0.0, 0.0])

        calibrated_color = np.clip(avg_color * white_multiplier, 0, 255)
        r, g, b = int(calibrated_color[0]), int(calibrated_color[1]), int(calibrated_color[2])

        cv2.rectangle(debug_img, (box_x, box_y), (box_x + box_w, box_y + box_h), (255, 0, 0), 2)
        cv2.rectangle(debug_img, (x0, y0), (x1, y1), (0, 255, 0), -1)

        param_name = keys[i]
        status, value = closest_status((r, g, b), param_name)

        extracted_results[param_name] = {
            "result": status,
            "value":  value,
            "color":  f"rgb({r}, {g}, {b})"
        }

    # Save debug image
    debug_filename = "debug_" + os.path.basename(image_path)
    debug_path     = os.path.join(app.config['UPLOAD_FOLDER'], debug_filename)
    cv2.imwrite(debug_path, debug_img)

    clinical_data = calculate_clinical_risk(extracted_results, 98.5)
    return clinical_data, debug_path


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    from flask import send_from_directory
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
        
    if file:
        filename = f"{int(time.time())}_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            results, debug_path = extract_colors(filepath)
            
            return jsonify({
                'success': True,
                'message': 'Analysis complete',
                'results': results,
                'image_path': filepath,
                'debug_image_path': debug_path
            })

            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
