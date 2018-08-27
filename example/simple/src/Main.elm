module Main exposing (main)

import Browser
import Html


main =
    Browser.document
        { init = \flags -> ( flags, Cmd.none )
        , update = \_ exit -> ( exit, Cmd.none )
        , view = view
        , subscriptions = \_ -> Sub.none
        }


view : String -> Browser.Document msg
view model =
    { title = "Hello" ++ model
    , body =
        [ Html.text ("Hello" ++ model)
        ]
    }
