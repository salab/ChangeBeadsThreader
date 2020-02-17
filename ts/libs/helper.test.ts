import moment from "moment"
import { getPositionFromDateTime, minuteFromRem, remFromMinute } from "./helper"

test("remFromMinute", () => {
    expect(remFromMinute(10, 2)).toBe(20)
})

test("minuteFromRem", () => {
    expect(minuteFromRem(10, 2)).toBe(5)
})

test("getPositionFromDateTime", () => {
    expect(
        getPositionFromDateTime(
            moment("2019-04-19 10:10:30.000"),
            moment("2019-04-19 10:10:25.000"),
            5
        )
    ).toBe(2.5)

    expect(
        getPositionFromDateTime(
            moment("2019-04-19 10:20:30.000"),
            moment("2019-04-19 10:10:25.000"),
            5
        )
    ).toBe(52.5)
})
