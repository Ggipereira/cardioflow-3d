# CardioFlow3D

CardioFlow3D is a biomedical engineering proof-of-concept project focused on the automation of cardiac segmentation from CT scans and the conceptual design of a digital workflow to support cardiothoracic surgery planning.

This project was developed within the Biomedical Engineering degree at NOVA FCT, in collaboration with Hospital de Santa Marta.

---

## Background

Manual cardiac segmentation from CT images is a time-consuming and operator-dependent process, often requiring several hours of expert work per case. These limitations reduce scalability, introduce variability, and hinder the integration of advanced 3D modelling into routine clinical workflows.

---

## Project Objectives

The main goals of CardioFlow3D were:

- To explore the feasibility of AI-based automatic cardiac segmentation using deep learning
- To evaluate time savings and consistency relative to manual segmentation
- To conceptually design a digital workflow that guides clinicians from CT acquisition to 3D model validation

This project is intended as a **prototype and proof of concept**, not as a clinically validated system.

---

## Technical Approach

### AI-Based Segmentation
- A deep learning segmentation pipeline was trained using the MONAI framework
- Integration with 3D Slicer enabled preprocessing, inference, and visualization
- The focus was on demonstrating feasibility rather than clinical performance optimisation

### Web Platform (Demonstrator)
- A web-based platform (CardioFlow3D) was developed as a demonstrator
- The platform conceptually guides the user through the full workflow:
  1. CT import
  2. Cardiac series selection
  3. Segmentation
  4. 3D model export
  5. Visualization and validation

The platform is **not fully functional** and is intended solely to illustrate how such a system could be implemented with further development and investment.

🔗 Demonstrator website:  
https://cardioflow-3d.vercel.app/

---

## Results

- Significant reduction in segmentation time compared to manual workflows
- Improved consistency and reproducibility in generated segmentations
- Successful demonstration of an end-to-end conceptual pipeline

All results should be interpreted in the context of a prototype-level study.

---

## Clinical Context

This project was developed using anonymized clinical imaging data in collaboration with:

- Hospital de Santa Marta (Lisbon)

No clinical deployment or patient-facing use was performed.

---

## Limitations

- Prototype-level implementation
- Limited dataset
- No formal clinical validation
- No integration with hospital PACS or clinical information systems

---

## Future Work

- Expansion of training datasets
- Systematic clinical validation with medical teams
- Integration with PACS and hospital workflows
- Robustness and performance optimisation
- Regulatory and safety assessment

---

## Authors

- Guilherme Pereira  
- Diogo Casquinha  
- Vicente Soares  

Biomedical Engineering — NOVA FCT
