from sqlalchemy.orm import Session

from app.models.attendance import Attendance


class AttendanceRepository:
    @staticmethod
    def create(db: Session, attendance: Attendance):
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        return attendance

    @staticmethod
    def get_by_staff_and_date(db: Session, staff_id, date_):
        return (
            db.query(Attendance)
            .filter(Attendance.staff_id == staff_id, Attendance.date == date_)
            .first()
        )

    @staticmethod
    def get_by_staff(db: Session, staff_id):
        return (
            db.query(Attendance)
            .filter(Attendance.staff_id == staff_id)
            .order_by(Attendance.date.desc())
            .all()
        )

    @staticmethod
    def update(db: Session, attendance: Attendance):
        db.commit()
        db.refresh(attendance)
        return attendance
