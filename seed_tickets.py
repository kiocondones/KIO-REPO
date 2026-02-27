"""
seed_tickets.py
Run from the project root:  python seed_tickets.py

Creates realistic fake tickets assigned to the default technician
(technician@gcg.com) so you can see all frontend features working.

Seeded data:
  - 3 IN_PROGRESS tickets  (with tasks, checklist, worklogs, history)
  - 2 OPEN tickets
  - 2 COMPLETED tickets    (with resolution + feedback rating)
  - 1 ON_HOLD ticket
"""

from app import app, db, bcrypt
from app.models import (
    Ticket, TicketStatus, TicketType,
    Task, CheckList, WorkLog, History, Resolution,
    User, SLAPolicy,
    Feedback,
)
from app.utils import generate_id
from datetime import datetime, timezone, timedelta

utc = timezone.utc

def now():
    return datetime.now(utc)

def days_ago(n):
    return now() - timedelta(days=n)


TICKET_DEFS = [
    # IN_PROGRESS ──────────────────────────────────────────────────────
    {
        "title": "Network Connection Dropping Intermittently",
        "description": "Multiple workstations on Floor 3 are experiencing random Wi-Fi disconnections every 15-20 minutes. Affects about 12 users. Issue started after Monday's patch update.",
        "status": TicketStatus.IN_PROGRESS,
        "location": "Floor 3 - Open Office",
        "ticket_type": TicketType.INCIDENT,
        "created_offset_days": 2,
        "tasks": [
            ("Check router firmware version", True),
            ("Run network diagnostics on affected machines", True),
            ("Replace patch cables on switch port 12", False),
            ("Test connection stability post-fix", False),
        ],
        "checklist": [
            ("Identified affected workstations", True),
            ("Reviewed patch update logs", True),
            ("Coordinated with network team", False),
            ("Notified affected users of progress", False),
        ],
        "worklogs": [
            "Initial assessment done. 12 machines affected on the same subnet. Suspect the Monday patch changed some adapter settings.",
            "Checked router firmware — it's 2 versions behind. Scheduling firmware update for tonight's maintenance window.",
        ],
    },
    {
        "title": "Printer Not Responding - HR Department",
        "description": "The HP LaserJet Pro in HR cannot be detected by any workstation after the office move last week. Print jobs queue up but never execute.",
        "status": TicketStatus.IN_PROGRESS,
        "location": "HR Department - Room 201",
        "ticket_type": TicketType.INCIDENT,
        "created_offset_days": 1,
        "tasks": [
            ("Reconnect printer to new network outlet", True),
            ("Reinstall printer drivers on affected PCs", False),
            ("Set static IP for printer", False),
        ],
        "checklist": [
            ("Confirmed printer powers on", True),
            ("Verified network cable connection", True),
            ("Cleared print queue", False),
        ],
        "worklogs": [
            "On-site visit completed. Printer reconnected. IP address conflict detected — another device is using the same address.",
        ],
    },
    {
        "title": "Email Client Crashing on Startup",
        "description": "User reports Outlook crashes immediately on launch with error 0x80070057. Reinstalling did not fix the issue. Affects one workstation only.",
        "status": TicketStatus.IN_PROGRESS,
        "location": "Finance Department - Desk 14",
        "ticket_type": TicketType.INCIDENT,
        "created_offset_days": 1,
        "tasks": [
            ("Run Outlook in safe mode", True),
            ("Repair Office installation", True),
            ("Create new Outlook profile", False),
            ("Restore PST backup if needed", False),
        ],
        "checklist": [
            ("Backed up user data", True),
            ("Checked Windows Event Viewer logs", True),
            ("Cleared Outlook cache", False),
            ("Tested with new Windows user profile", False),
        ],
        "worklogs": [
            "Safe mode works fine — likely a corrupted add-in. Disabled all add-ins; testing standard launch now.",
            "Issue traced to a corrupted Zoom for Outlook add-in. Removed and reinstalling the latest version.",
        ],
    },

    # OPEN ─────────────────────────────────────────────────────────────
    {
        "title": "Request for Additional Monitor - Dev Team",
        "description": "Junior developer assigned to a new project requiring dual monitors for IDE and browser testing. Requesting one additional 24-inch monitor.",
        "status": TicketStatus.OPEN,
        "location": "IT Development Area - Desk 7",
        "ticket_type": TicketType.SERVICE,
        "created_offset_days": 3,
        "tasks": [],
        "checklist": [],
        "worklogs": [],
    },
    {
        "title": "Software Installation - Adobe Acrobat Pro",
        "description": "Marketing team needs Adobe Acrobat Pro installed on 4 workstations for PDF editing and e-signature workflows. License has been approved by procurement.",
        "status": TicketStatus.OPEN,
        "location": "Marketing Department",
        "ticket_type": TicketType.SERVICE,
        "created_offset_days": 4,
        "tasks": [],
        "checklist": [],
        "worklogs": [],
    },

    # COMPLETED ────────────────────────────────────────────────────────
    {
        "title": "Laptop Keyboard Unresponsive - Keys Stuck",
        "description": "Account manager's laptop keyboard has several keys that do not respond or register double keystrokes. Liquid may have been spilled.",
        "status": TicketStatus.COMPLETED,
        "location": "Sales Office - Room 105",
        "ticket_type": TicketType.INCIDENT,
        "created_offset_days": 7,
        "resolved_offset_days": 5,
        "tasks": [
            ("Clean keyboard with compressed air", True),
            ("Test individual key switches", True),
            ("Replace keyboard module", True),
        ],
        "checklist": [
            ("Documented liquid damage", True),
            ("Got approval for hardware replacement", True),
            ("Ordered replacement part", True),
            ("Installed and tested replacement", True),
        ],
        "worklogs": [
            "Keyboard module cleaned — still unresponsive. Liquid damage confirmed on PCB.",
            "Replacement keyboard module installed. All keys tested and working.",
        ],
        "resolution": "Keyboard module replaced due to liquid damage. All 104 keys tested and confirmed functional.",
        "rating": 5,
    },
    {
        "title": "VPN Access Not Working After Password Reset",
        "description": "After resetting their Active Directory password, user cannot authenticate to the company VPN. Error: authentication failed. Other users unaffected.",
        "status": TicketStatus.COMPLETED,
        "location": "Remote - Work From Home",
        "ticket_type": TicketType.INCIDENT,
        "created_offset_days": 10,
        "resolved_offset_days": 9,
        "tasks": [
            ("Sync AD password to VPN profile", True),
            ("Test VPN connection", True),
        ],
        "checklist": [
            ("Confirmed AD password reset completed", True),
            ("Flushed VPN credential cache", True),
            ("Verified MFA token is correct", True),
        ],
        "worklogs": [
            "VPN uses cached credentials not updated after AD reset. Cleared VPN credential cache and re-enrolled MFA. User can now connect.",
        ],
        "resolution": "VPN credential cache cleared and MFA re-enrolled. User confirmed successful connection.",
        "rating": 4,
    },

    # ON_HOLD ──────────────────────────────────────────────────────────
    {
        "title": "Conference Room AV System Not Displaying HDMI",
        "description": "The projector in Conference Room B does not display laptop screens via HDMI. Audio works but video shows No Signal. Affects all scheduled meetings this week.",
        "status": TicketStatus.ON_HOLD,
        "location": "Conference Room B - 3rd Floor",
        "ticket_type": TicketType.INCIDENT,
        "created_offset_days": 5,
        "tasks": [
            ("Test with different HDMI cables", True),
            ("Check projector HDMI input settings", True),
            ("Order replacement HDMI board", False),
        ],
        "checklist": [
            ("Tested multiple laptops", True),
            ("Confirmed audio works only video fails", True),
            ("Contacted AV vendor for support", True),
            ("Waiting for replacement part delivery", False),
        ],
        "worklogs": [
            "Tested with 3 different cables and 4 laptops. Issue is in the projector HDMI input board.",
            "On hold pending delivery of replacement HDMI board from vendor. ETA 3-5 business days. Workaround: use Conference Room A.",
        ],
    },
]


def seed():
    with app.app_context():

        technician = User.query.filter_by(email="technician@gcg.com").first()
        if not technician:
            print("ERROR: technician@gcg.com not found. Run the app once first to seed defaults.")
            return

        admin     = User.query.filter_by(email="admin@gcg.com").first()
        requester = User.query.filter_by(email="requestor@gcg.com").first() or technician
        policy    = SLAPolicy.query.filter_by(account_id=technician.account_id).first()

        if not policy:
            print("ERROR: No SLA policy found. Run the app once first.")
            return

        account_id = technician.account_id

        existing = Ticket.query.filter_by(assigned_to_id=technician.id).count()
        if existing >= len(TICKET_DEFS):
            print(f"Already found {existing} tickets for technician. Skipping.")
            print("Delete existing tickets first if you want to re-seed.")
            return

        print(f"Seeding {len(TICKET_DEFS)} tickets for {technician.name} ({technician.email})...")

        for td in TICKET_DEFS:
            created_at  = days_ago(td["created_offset_days"])
            resolved_at = days_ago(td["resolved_offset_days"]) if "resolved_offset_days" in td else None

            ticket_id = generate_id(account_id=account_id)

            ticket = Ticket(
                id=ticket_id,
                account_id=account_id,
                title=td["title"],
                description=td["description"],
                status=td["status"],
                location=td["location"],
                ticket_type=td["ticket_type"],
                priority=policy,
                requester=requester,
                assigned_to=technician,
                assigned_by=admin or technician,
                is_assigned=True,
                created_at=created_at,
                updated_at=created_at,
                resolved_at=resolved_at,
            )
            db.session.add(ticket)
            db.session.flush()

            # ── History ──────────────────────────────────────────────
            db.session.add(History(
                account_id=account_id, ticket_id=ticket.id,
                user_id=(admin or technician).id,
                action="Ticket created", details="Service request created",
                created_at=created_at,
            ))
            db.session.add(History(
                account_id=account_id, ticket_id=ticket.id,
                user_id=(admin or technician).id,
                action="Ticket assigned", details=f"Assigned to {technician.name}",
                created_at=created_at + timedelta(minutes=5),
            ))

            if td["status"] == TicketStatus.IN_PROGRESS:
                db.session.add(History(
                    account_id=account_id, ticket_id=ticket.id,
                    user_id=technician.id,
                    action="Work Started", details="Technician accepted and started work.",
                    created_at=created_at + timedelta(hours=1),
                ))

            if td["status"] == TicketStatus.ON_HOLD:
                db.session.add(History(
                    account_id=account_id, ticket_id=ticket.id,
                    user_id=technician.id,
                    action="Paused", details="Waiting for replacement parts from vendor.",
                    created_at=created_at + timedelta(hours=2),
                ))

            if td["status"] == TicketStatus.COMPLETED:
                db.session.add(History(
                    account_id=account_id, ticket_id=ticket.id,
                    user_id=technician.id,
                    action="Resolved", details=td.get("resolution", "Ticket resolved."),
                    created_at=resolved_at,
                ))

            # ── Tasks ────────────────────────────────────────────────
            for j, (task_title, completed) in enumerate(td.get("tasks", [])):
                db.session.add(Task(
                    account_id=account_id, ticket_id=ticket.id,
                    title=task_title, description=task_title,
                    assigned_to_id=technician.id,
                    is_completed=completed,
                    due_at=created_at + timedelta(days=3),
                    created_at=created_at + timedelta(minutes=10 + j),
                ))
                if completed:
                    db.session.add(History(
                        account_id=account_id, ticket_id=ticket.id,
                        user_id=technician.id,
                        action="Task Accomplished", details=f"Task completed: {task_title}",
                        created_at=created_at + timedelta(hours=2 + j),
                    ))

            # ── Checklist ────────────────────────────────────────────
            for j, (item_title, completed) in enumerate(td.get("checklist", [])):
                db.session.add(CheckList(
                    account_id=account_id, ticket_id=ticket.id,
                    name=item_title, title=item_title, description=item_title,
                    is_completed=completed,
                    created_at=created_at + timedelta(minutes=15 + j),
                ))

            # ── Worklogs ─────────────────────────────────────────────
            for j, message in enumerate(td.get("worklogs", [])):
                db.session.add(WorkLog(
                    account_id=account_id, ticket_id=ticket.id,
                    title=f"Worklog {j + 1}", description=message,
                    author_id=technician.id,
                    created_at=created_at + timedelta(hours=1 + j * 2),
                ))
                db.session.add(History(
                    account_id=account_id, ticket_id=ticket.id,
                    user_id=technician.id,
                    action="Worklog added", details=message[:100],
                    created_at=created_at + timedelta(hours=1 + j * 2),
                ))

            # ── Resolution ───────────────────────────────────────────
            if "resolution" in td:
                db.session.add(Resolution(
                    account_id=account_id, ticket_id=ticket.id,
                    description=td["resolution"],
                    is_draft=False,
                    created_at=resolved_at,
                ))

            # ── Feedback ─────────────────────────────────────────────
            if "rating" in td:
                db.session.add(Feedback(
                    account_id=account_id, ticket_id=ticket.id,
                    user_id=requester.id,
                    rating=td["rating"],
                    comment="Good job, issue resolved quickly.",
                    created_at=resolved_at + timedelta(hours=1),
                ))

            status_label = td["status"].value.replace("_", " ").title()
            print(f"  [{status_label:15}] {td['title'][:55]}")

        db.session.commit()
        print(f"\nDone! {len(TICKET_DEFS)} tickets seeded.")
        print("Login: technician@gcg.com / password")


if __name__ == "__main__":
    seed()
