from sqlalchemy.orm import Session

from app.models.salary import Salary


class SalaryRepository:
    @staticmethod
    def create(db: Session, salary: Salary):
        db.add(salary)
        db.commit()
        db.refresh(salary)
        return salary

    @staticmethod
    def get_by_staff(db: Session, staff_id):
        return (
            db.query(Salary)
            .filter(Salary.staff_id == staff_id)
            .order_by(Salary.effective_date.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, salary_id):
        return db.query(Salary).filter(Salary.id == salary_id).first()

    @staticmethod
    def update(db: Session, salary: Salary):
        db.commit()
        db.refresh(salary)
        return salary

    @staticmethod
    def delete(db: Session, salary: Salary):
        db.delete(salary)
        db.commit()
