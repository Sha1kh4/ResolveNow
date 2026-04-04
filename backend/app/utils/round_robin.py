from typing import Any


def get_next_faculty_id(
    faculty_user_ids: list[Any],
    last_assigned_faculty_id: Any | None = None,
) -> Any:
    if not faculty_user_ids:
        raise ValueError("No faculty users available for round robin assignment.")

    if last_assigned_faculty_id is None:
        return faculty_user_ids[0]

    faculty_ids_as_strings = [str(faculty_id) for faculty_id in faculty_user_ids]
    last_assigned_as_string = str(last_assigned_faculty_id)

    if last_assigned_as_string not in faculty_ids_as_strings:
        return faculty_user_ids[0]

    last_index = faculty_ids_as_strings.index(last_assigned_as_string)
    next_index = (last_index + 1) % len(faculty_user_ids)
    return faculty_user_ids[next_index]
