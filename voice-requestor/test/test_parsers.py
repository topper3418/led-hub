import pytest
from src.models import Color, LedState, Device
from src.parser import DeviceParsingError

# --- Tests for Color ---
@pytest.mark.parametrize(
    "input_data, expected_json",
    [
        ({"r": 255, "g": 128, "b": 64}, {"red": 255, "green": 128, "blue": 64}),
        ({"r": 0, "g": 0, "b": 0}, {"red": 0, "green": 0, "blue": 0}),
        ({"r": 255, "g": 255, "b": 255}, {"red": 255, "green": 255, "blue": 255}),
        ({"r": 128, "g": 128, "b": 128}, {"red": 128, "green": 128, "blue": 128}),
        ({"r": 64, "g": 128, "b": 255}, {"red": 64, "green": 128, "blue": 255}),
    ]
)
def test_color_parsing(input_data, expected_json):
    color = Color.from_dict(input_data)
    assert color.json == expected_json


@pytest.mark.parametrize(
    "input_data, expected_exception, expected_message",
    [
        ({"r": 255, "g": 128}, DeviceParsingError, "Color data is missing key: 'b'"),
        ({"r": 255, "g": "invalid", "b": 64}, DeviceParsingError, "Color data has invalid value"),
    ]
)
def test_color_parsing_errors(input_data, expected_exception, expected_message):
    with pytest.raises(expected_exception, match=expected_message):
        Color.from_dict(input_data)


# --- Tests for LedState ---
@pytest.mark.parametrize(
    "input_data, expected_json",
    [
        (
            {"on": True, "brightness": 100, "color": {"r": 255, "g": 128, "b": 64}, "connected": True},
            {"on": True, "brightness": 100, "color": {"red": 255, "green": 128, "blue": 64}, "connected": True},
        ),
        (
            {"on": False, "brightness": 0, "color": {"r": 0, "g": 0, "b": 0}, "connected": False},
            {"on": False, "brightness": 0, "color": {"red": 0, "green": 0, "blue": 0}, "connected": False},
        ),
        (
            {"on": True, "brightness": 50, "color": {"r": 128, "g": 128, "b": 128}, "connected": True},
            {"on": True, "brightness": 50, "color": {"red": 128, "green": 128, "blue": 128}, "connected": True},
        ),
        (
            {"on": False, "brightness": 100, "color": {"r": 255, "g": 255, "b": 255}, "connected": False},
            {"on": False, "brightness": 100, "color": {"red": 255, "green": 255, "blue": 255}, "connected": False},
        ),
        (
            {"on": True, "brightness": 75, "color": {"r": 64, "g": 128, "b": 255}, "connected": True},
            {"on": True, "brightness": 75, "color": {"red": 64, "green": 128, "blue": 255}, "connected": True},
        ),
    ]
)
def test_led_state_parsing(input_data, expected_json):
    led_state = LedState.from_dict(input_data)
    assert led_state.json == expected_json


@pytest.mark.parametrize(
    "input_data, expected_exception, expected_message",
    [
        (
            {"on": True, "brightness": 100, "connected": True},
            DeviceParsingError,
            "LedState data is missing key: 'color'"
        ),
        (
            {"on": True, "brightness": "invalid", "color": {"r": 255, "g": 128, "b": 64}, "connected": True},
            DeviceParsingError,
            "LedState data has invalid value"
        ),
    ]
)
def test_led_state_parsing_errors(input_data, expected_exception, expected_message):
    with pytest.raises(expected_exception, match=expected_message):
        LedState.from_dict(input_data)


# --- Tests for Device ---
@pytest.mark.parametrize(
    "input_data, expected_json",
    [
        (
            {
                "name": "DevPi",
                "mac": "28:cd:c1:11:96:f5",
                "on": True,
                "brightness": 100,
                "color": {"r": 255, "g": 128, "b": 64},
                "connected": True
            },
            {
                "data": {
                    "name": "DevPi",
                    "mac": "28:cd:c1:11:96:f5",
                },
                "state": {
                    "on": True,
                    "brightness": 100,
                    "color": {"red": 255, "green": 128, "blue": 64},
                    "connected": True
                }
            }
        ),
        (
            {
                "name": "DevPi",
                "mac": "28:cd:c1:11:96:f5",
                "on": False,
                "brightness": 0,
                "color": {"r": 0, "g": 0, "b": 0},
                "connected": False
            },
            {
                "data": {
                    "name": "DevPi",
                    "mac": "28:cd:c1:11:96:f5",
                },
                "state": {
                    "on": False,
                    "brightness": 0,
                    "color": {"red": 0, "green": 0, "blue": 0},
                    "connected": False
                }
            }
        ),
        (
            {
                "name": "DevPi",
                "mac": "28:cd:c1:11:96:f5",
                "on": True,
                "brightness": 50,
                "color": {"r": 128, "g": 128, "b": 128},
                "connected": True
            },
            {
                "data": {
                    "name": "DevPi",
                    "mac": "28:cd:c1:11:96:f5",
                },
                "state": {
                    "on": True,
                    "brightness": 50,
                    "color": {"red": 128, "green": 128, "blue": 128},
                    "connected": True
                }
            }
        ),
        (
            {
                "name": "DevPi",
                "mac": "28:cd:c1:11:96:f5",
                "on": False,
                "brightness": 100,
                "color": {"r": 255, "g": 255, "b": 255},
                "connected": False
            },
            {
                "data": {
                    "name": "DevPi",
                    "mac": "28:cd:c1:11:96:f5",
                },
                "state": {
                    "on": False,
                    "brightness": 100,
                    "color": {"red": 255, "green": 255, "blue": 255},
                    "connected": False
                }
            }
        ),
    ]
)
def test_device_parsing(input_data, expected_json):
    device = Device(input_data)
    assert device.json == expected_json


@pytest.mark.parametrize(
    "input_data, expected_exception, expected_message",
    [
        (
            {
                "name": "DevPi", 
                "mac": "28:cd:c1:11:96:f5", 
                "connected": True, 
                "on": True, 
                "brightness": 100
            },
            DeviceParsingError,
            "LedState data is missing key: 'color'"
        ),
        (
            {
                "name": "DevPi", 
                "mac": "28:cd:c1:11:96:f5", 
                "connected": True,
                "on": True, 
                "brightness": "invalid", 
                "color": {"r": 255, "g": 128, "b": 64}, 
            },
            DeviceParsingError,
            "LedState data has invalid value"
        ),
        (
            {},
            DeviceParsingError,
            "DeviceData data is missing key: 'name'"
        ),
        (
            {
                "name": "DevPi", 
                "mac": "28:cd:c1:11:96:f5", 
                "connected": True,
                "on": True,
            },
            DeviceParsingError,
            "LedState data is missing key: 'brightness'"
        ),
        (
            {
                "name": "DevPi", 
                "mac": "28:cd:c1:11:96:f5", 
                "on": False, 
                "brightness": 100, 
                "color": {"r": 255, "g": 255, "b": "badColor"}, 
                "connected": False
            },
            DeviceParsingError,
            "Color data has invalid value"
        ),
    ]
)
def test_device_parsing_errors(input_data, expected_exception, expected_message):
    with pytest.raises(expected_exception, match=expected_message):
        Device(input_data)
