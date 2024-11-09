from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def create_budget_report():
    doc = SimpleDocTemplate("uploads/budget_report_2023.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    elements.append(Paragraph("Ministry Budget Allocations 2023", styles['Heading1']))
    elements.append(Spacer(1, 20))
    
    # Sample data
    data = [
        ['Ministry', 'Budget (GHS)', 'Percentage'],
        ['Education', '15,000,000', '25%'],
        ['Health', '12,000,000', '20%'],
        ['Infrastructure', '18,000,000', '30%'],
        ['Agriculture', '9,000,000', '15%'],
        ['Other', '6,000,000', '10%']
    ]
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)

def create_infrastructure_report():
    doc = SimpleDocTemplate("uploads/school_infrastructure_2023.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    elements.append(Paragraph("Public School Infrastructure Survey - Greater Accra", styles['Heading1']))
    elements.append(Spacer(1, 20))
    
    data = [
        ['District', 'Total Schools', 'Good Condition', 'Needs Repair'],
        ['Accra Metro', '45', '30', '15'],
        ['Tema Metro', '35', '25', '10'],
        ['Ga South', '28', '18', '10'],
        ['La-Dade Kotopon', '22', '15', '7']
    ]
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)

def create_procurement_report():
    doc = SimpleDocTemplate("uploads/healthcare_procurement_2023.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    elements.append(Paragraph("Healthcare Equipment Procurement Records 2023", styles['Heading1']))
    elements.append(Spacer(1, 20))
    
    data = [
        ['Equipment Type', 'Quantity', 'Cost (GHS)', 'Supplier'],
        ['X-Ray Machines', '5', '2,500,000', 'MedTech Ltd'],
        ['Ventilators', '10', '1,800,000', 'HealthCare Solutions'],
        ['ICU Beds', '20', '900,000', 'Hospital Supplies Co'],
        ['Ultrasound Devices', '8', '1,200,000', 'Imaging Systems']
    ]
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)

if __name__ == "__main__":
    create_budget_report()
    create_infrastructure_report()
    create_procurement_report()
